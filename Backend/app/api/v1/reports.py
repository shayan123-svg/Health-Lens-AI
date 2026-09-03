from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.core.auth import get_current_user
from app.services.document_service import extract_text_from_file
from app.services.extraction_service import (
    extract_features_from_file,
    extract_features_from_text,
)
from app.services.feature_service import (
    get_missing_features,
    sanitize_features,
    validate_feature_completeness,
)
from app.services.feature_questions import FEATURE_QUESTIONS
from app.schemas.report import ReportDataUpdate, TextReportRequest
from app.services.llm_service import generate_medical_insights
from app.services.prediction_service import predict_diabetes_risk
from app.services.report_service import (
    create_report,
    delete_report,
    get_report_for_user,
    get_user_reports,
    update_report,
)

router = APIRouter()


# ==========================================
# UPLOAD CONFIGURATION
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[3]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}

# Must match the limit advertised by the frontend UI
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


# ==========================================
# LIST USER REPORTS
# ==========================================

@router.get("/")
def list_reports(user: dict = Depends(get_current_user)):
    """
    Return all reports belonging to the authenticated user,
    newest first.
    """

    reports = get_user_reports(user["user_id"])

    # Shape each item for the history/dashboard view
    result = []
    for r in reports:
        prediction = r.get("prediction") or {}
        result.append({
            "report_id": r["report_id"],
            "filename": r["filename"],
            "file_type": r["file_type"],
            "status": r["status"],
            "risk_percentage": prediction.get("risk_percentage"),
            "risk_category": prediction.get("risk_category"),
            "created_at": r["created_at"],
        })

    return {"reports": result, "total": len(result)}


# ==========================================
# GET SINGLE REPORT
# ==========================================

@router.get("/{report_id}")
def get_report_details(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Get full details of a specific report.
    Only the report's owner can access it.
    """

    report = get_report_for_user(report_id, user["user_id"])

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or you do not have permission to view it.",
        )

    return report


# ==========================================
# UPLOAD MEDICAL REPORT
# ==========================================

@router.post("/upload")
async def upload_medical_report(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Upload a user's medical report.

    Supported formats:
    PDF, DOCX, PNG, JPG, JPEG, WEBP (max 10 MB)
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided.",
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type: {extension}. "
                f"Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    file_content = await file.read()

    if len(file_content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                "File is too large. "
                "The maximum allowed size is 10 MB."
            ),
        )

    if len(file_content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    report_id = str(uuid4())

    saved_filename = f"{report_id}{extension}"

    file_path = UPLOAD_DIR / saved_filename

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    # ------------------------------------------
    # Persist the new report row in Supabase
    # ------------------------------------------

    try:
        create_report(
            report_id=report_id,
            filename=file.filename,
            stored_filename=saved_filename,
            file_type=extension,
            user_id=user["user_id"],
        )
    except Exception as e:
        # Do not keep orphaned files when persistence fails
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save report record: {str(e)}",
        )

    return {
        "report_id": report_id,
        "filename": file.filename,
        "stored_filename": saved_filename,
        "file_type": extension,
        "status": "uploaded",
        "message": "Medical report uploaded successfully.",
    }


# ==========================================
# CREATE REPORT FROM RAW TEXT
# ==========================================

@router.post("/text")
def create_report_from_text(
    payload: TextReportRequest,
    user: dict = Depends(get_current_user),
):
    """
    Create a report from patient-submitted text (pasted report content
    or a structured manual intake). The text is stored as a .txt file,
    then features are extracted immediately so the caller can continue
    to the missing-fields questionnaire or straight to analysis.
    """

    raw_text = payload.raw_text.strip()

    report_id = str(uuid4())

    saved_filename = f"{report_id}.txt"

    file_path = UPLOAD_DIR / saved_filename

    file_path.write_text(raw_text, encoding="utf-8")

    filename = (payload.title or "Manual Intake Assessment").strip()

    try:
        create_report(
            report_id=report_id,
            filename=filename,
            stored_filename=saved_filename,
            file_type=".txt",
            user_id=user["user_id"],
        )
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save report record: {str(e)}",
        )

    try:
        features = extract_features_from_text(raw_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feature extraction failed: {str(e)}",
        )

    features = sanitize_features(features)

    completeness = validate_feature_completeness(features)

    report_status = (
        "ready_for_prediction"
        if completeness["complete"]
        else "needs_information"
    )

    try:
        update_report(
            report_id,
            user["user_id"],
            {
                "extracted_features": features,
                "status": report_status,
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save extracted features: {str(e)}",
        )

    return {
        "report_id": report_id,
        "filename": filename,
        "file_type": ".txt",
        "status": report_status,
        "complete": completeness["complete"],
        "extracted_features": features,
        "missing_features": completeness["missing_features"],
    }


# ==========================================
# EXTRACT RAW TEXT
# ==========================================

@router.get("/{report_id}/text")
async def extract_report_text(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Extract raw text from an uploaded medical report (DOCX, PDF, or Images).
    """

    report = get_report_for_user(report_id, user["user_id"])

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    matching_files = list(
        UPLOAD_DIR.glob(f"{report_id}.*")
    )

    if not matching_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found on disk.",
        )

    file_path = matching_files[0]
    extension = file_path.suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text extraction for this file type is not supported.",
        )

    try:
        extracted_text = extract_text_from_file(file_path)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract report text: {str(e)}",
        )

    return {
        "report_id": report_id,
        "file_type": extension,
        "status": "extracted",
        "text": extracted_text,
    }


# ==========================================
# EXTRACT ML FEATURES
# ==========================================

@router.post("/{report_id}/extract")
async def extract_report_features(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Extract HealthLens ML features from an uploaded report (DOCX, PDF, or Images).
    Persists extracted_features to Supabase.
    """

    # ------------------------------------------
    # Check that report exists and belongs to user
    # ------------------------------------------

    report = get_report_for_user(report_id, user["user_id"])

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found. Upload the file first.",
        )

    # ------------------------------------------
    # Locate the file on disk
    # ------------------------------------------

    matching_files = list(
        UPLOAD_DIR.glob(f"{report_id}.*")
    )

    if not matching_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found on disk.",
        )

    file_path = matching_files[0]
    extension = file_path.suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type for extraction: {extension}",
        )

    # ------------------------------------------
    # Extract features from document or image
    # ------------------------------------------

    try:
        features = extract_features_from_file(file_path)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feature extraction failed: {str(e)}",
        )

    # ------------------------------------------
    # Sanitize (coerce types, enforce model ranges)
    # ------------------------------------------

    features = sanitize_features(features)

    # ------------------------------------------
    # Persist extracted features to Supabase
    # ------------------------------------------

    completeness = validate_feature_completeness(features)

    report_status = (
        "ready_for_prediction"
        if completeness["complete"]
        else "needs_information"
    )

    try:
        update_report(
            report_id,
            user["user_id"],
            {
                "extracted_features": features,
                "status": report_status,
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save extracted features: {str(e)}",
        )

    return {
        "report_id": report_id,
        "status": report_status,
        "complete": completeness["complete"],
        "extracted_features": features,
        "missing_features": completeness["missing_features"],
    }


# ==========================================
# MISSING FIELDS
# ==========================================

@router.get("/{report_id}/missing-fields")
async def get_missing_report_fields(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Return user-friendly questions for all
    ML features that were not found in the report.
    Reads extracted_features from Supabase — no re-extraction needed.
    """

    report = get_report_for_user(report_id, user["user_id"])

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    extracted_features = report.get("extracted_features") or {}

    if not extracted_features:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No extracted features found for this report. "
                "Run the extraction endpoint first."
            ),
        )

    missing_features = get_missing_features(extracted_features)

    questions = []

    for feature in missing_features:
        question = FEATURE_QUESTIONS.get(feature)
        if question:
            questions.append({
                "field": feature,
                **question,
            })

    return {
        "report_id": report_id,
        "complete": len(missing_features) == 0,
        "missing_count": len(missing_features),
        "fields": questions,
    }


# ==========================================
# UPDATE USER-PROVIDED DATA
# ==========================================

@router.patch("/{report_id}/data")
async def update_report_data(
    report_id: str,
    data: ReportDataUpdate,
    user: dict = Depends(get_current_user),
):
    """
    Add or update user-provided medical information.
    Merges into user_features in Supabase.
    """

    report = get_report_for_user(report_id, user["user_id"])

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Report not found. "
                "Upload and run extraction first."
            ),
        )

    # Convert Pydantic model to dictionary
    user_data = data.model_dump(exclude_none=True)

    # Merge into existing user_features
    existing_user_features = report.get("user_features") or {}

    updated_user_features = {
        **existing_user_features,
        **user_data,
    }

    # Persist merged user_features to Supabase
    try:
        update_report(
            report_id,
            user["user_id"],
            {"user_features": updated_user_features},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save user data: {str(e)}",
        )

    # Compute remaining missing features
    extracted_features = report.get("extracted_features") or {}

    merged_features = {
        **extracted_features,
        **updated_user_features,
    }

    missing_features = get_missing_features(merged_features)

    report_status = (
        "ready_for_prediction"
        if not missing_features
        else "needs_information"
    )

    return {
        "report_id": report_id,
        "status": report_status,
        "complete": len(missing_features) == 0,
        "provided_features": user_data,
        "all_features": merged_features,
        "missing_features": missing_features,
    }


# ==========================================
# RUN ANALYSIS
# ==========================================

@router.post("/{report_id}/analyze")
async def analyze_report(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Run the final HealthLens diabetes-risk model
    using the complete 21-feature dataset.
    Persists final_features and prediction to Supabase.
    """

    report = get_report_for_user(report_id, user["user_id"])

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Report not found. "
                "Upload and extract the report first."
            ),
        )

    extracted_features = report.get("extracted_features") or {}
    user_features = report.get("user_features") or {}

    # ------------------------------------------
    # Merge + sanitize features
    # ------------------------------------------

    features = sanitize_features({
        **extracted_features,
        **user_features,
    })

    # ------------------------------------------
    # Validate completeness
    # ------------------------------------------

    missing_features = get_missing_features(features)

    if missing_features:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": (
                    "Cannot run prediction because "
                    "required features are missing."
                ),
                "missing_features": missing_features,
            },
        )

    # ------------------------------------------
    # Run ML prediction
    # ------------------------------------------

    try:
        prediction = predict_diabetes_risk(features)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )

    # ------------------------------------------
    # Generate LLM Medical Summary & Insights
    # ------------------------------------------

    try:
        ai_summary = generate_medical_insights(features, prediction)
    except Exception as e:
        print(f"[Analysis] LLM summary generation fallback: {e}")
        ai_summary = None

    # ------------------------------------------
    # Persist final result to Supabase
    # ------------------------------------------

    update_payload = {
        "final_features": features,
        "prediction": prediction,
        "model_version": prediction["model_version"],
        "status": "analysis_completed",
    }
    if ai_summary:
        prediction["summary"] = ai_summary
        update_payload["summary"] = ai_summary

    try:
        update_report(report_id, user["user_id"], update_payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction succeeded but failed to save result: {str(e)}",
        )

    return {
        "report_id": report_id,
        "status": "analysis_completed",
        "prediction": prediction,
        "summary": ai_summary,
    }


# ==========================================
# DELETE REPORT
# ==========================================

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report_endpoint(
    report_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Permanently delete a report.
    Only the report's owner can delete it.
    """

    deleted = delete_report(report_id, user["user_id"])

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or you do not have permission to delete it.",
        )

    # Clean up uploaded physical files for this report
    for matching_file in UPLOAD_DIR.glob(f"{report_id}.*"):
        try:
            matching_file.unlink()
        except Exception:
            pass
