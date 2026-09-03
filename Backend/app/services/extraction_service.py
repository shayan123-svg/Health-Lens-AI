import re
from pathlib import Path
from typing import Any
from app.services.llm_service import extract_features_with_llm


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features_rule_based(text: str) -> dict[str, Any]:
    """Rule-based regex extraction for standard medical report keywords."""
    text_lower = text.lower()
    extracted = {}

    # --------------------------------------------------------
    # BMI
    # --------------------------------------------------------

    bmi_match = re.search(
        r"\bbmi\b\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        text_lower
    )

    if bmi_match:
        extracted["BMI"] = float(bmi_match.group(1))

    # --------------------------------------------------------
    # HIGH BLOOD PRESSURE
    # --------------------------------------------------------

    # Check the negated phrase FIRST: "no high blood pressure"
    # contains the substring "high blood pressure".

    if "no high blood pressure" in text_lower:
        extracted["HighBP"] = 0

    elif "high blood pressure" in text_lower or "hypertension" in text_lower:
        extracted["HighBP"] = 1

    # --------------------------------------------------------
    # HIGH CHOLESTEROL
    # --------------------------------------------------------

    if "no high cholesterol" in text_lower:
        extracted["HighChol"] = 0

    elif "high cholesterol" in text_lower or "hypercholesterolemia" in text_lower:
        extracted["HighChol"] = 1

    # --------------------------------------------------------
    # SMOKER
    # --------------------------------------------------------

    if "non-smoker" in text_lower or "non smoker" in text_lower:
        extracted["Smoker"] = 0

    elif "smoker" in text_lower:
        extracted["Smoker"] = 1

    # --------------------------------------------------------
    # STROKE
    # --------------------------------------------------------

    if "history of stroke" in text_lower:
        if "no history of stroke" in text_lower:
            extracted["Stroke"] = 0
        else:
            extracted["Stroke"] = 1

    # --------------------------------------------------------
    # HEART DISEASE
    # --------------------------------------------------------

    if "heart disease" in text_lower:

        if (
            "no heart disease" in text_lower
            or "no history of heart disease" in text_lower
        ):
            extracted["HeartDiseaseorAttack"] = 0
        else:
            extracted["HeartDiseaseorAttack"] = 1

    # --------------------------------------------------------
    # PHYSICAL ACTIVITY
    # --------------------------------------------------------

    if "physical activity: yes" in text_lower:
        extracted["PhysActivity"] = 1

    elif "physical activity: no" in text_lower:
        extracted["PhysActivity"] = 0

    # --------------------------------------------------------
    # FRUITS
    # --------------------------------------------------------

    if "consumes fruit" in text_lower:

        if "consumes fruit regularly: yes" in text_lower:
            extracted["Fruits"] = 1
        else:
            extracted["Fruits"] = 0

    # --------------------------------------------------------
    # VEGETABLES
    # --------------------------------------------------------

    if "consumes vegetables" in text_lower:

        if "consumes vegetables regularly: yes" in text_lower:
            extracted["Veggies"] = 1
        else:
            extracted["Veggies"] = 0

    # --------------------------------------------------------
    # HEAVY ALCOHOL
    # --------------------------------------------------------

    if "heavy alcohol consumption: yes" in text_lower:
        extracted["HvyAlcoholConsump"] = 1

    elif "heavy alcohol consumption: no" in text_lower:
        extracted["HvyAlcoholConsump"] = 0

    # --------------------------------------------------------
    # HEALTHCARE
    # --------------------------------------------------------

    if "healthcare coverage: yes" in text_lower:
        extracted["AnyHealthcare"] = 1

    elif "healthcare coverage: no" in text_lower:
        extracted["AnyHealthcare"] = 0

    # --------------------------------------------------------
    # DOCTOR COST
    # --------------------------------------------------------

    if "due to cost: yes" in text_lower:
        extracted["NoDocbcCost"] = 1

    elif "due to cost: no" in text_lower:
        extracted["NoDocbcCost"] = 0

    # --------------------------------------------------------
    # GENERAL HEALTH
    # --------------------------------------------------------

    gen_health_match = re.search(
        r"general health rating category\s*[:\-]?\s*(\d+)",
        text_lower
    )

    if gen_health_match:
        extracted["GenHlth"] = int(
            gen_health_match.group(1)
        )

    # --------------------------------------------------------
    # MENTAL HEALTH
    # --------------------------------------------------------

    mental_match = re.search(
        r"poor mental health days.*?(\d+)",
        text_lower
    )

    if mental_match:
        extracted["MentHlth"] = int(
            mental_match.group(1)
        )

    # --------------------------------------------------------
    # PHYSICAL HEALTH
    # --------------------------------------------------------

    physical_match = re.search(
        r"poor physical health days.*?(\d+)",
        text_lower
    )

    if physical_match:
        extracted["PhysHlth"] = int(
            physical_match.group(1)
        )

    # --------------------------------------------------------
    # DIFFICULTY WALKING
    # --------------------------------------------------------

    if "difficulty walking or climbing stairs: yes" in text_lower:
        extracted["DiffWalk"] = 1

    elif "difficulty walking or climbing stairs: no" in text_lower:
        extracted["DiffWalk"] = 0

    # --------------------------------------------------------
    # AGE
    # --------------------------------------------------------

    age_match = re.search(
        r"age category\s*[:\-]?\s*(\d+)",
        text_lower
    )

    if age_match:
        extracted["Age"] = int(
            age_match.group(1)
        )

    # --------------------------------------------------------
    # SEX
    # --------------------------------------------------------

    sex_match = re.search(
        r"sex\s*[:\-]?\s*(\d+)",
        text_lower
    )

    if sex_match:
        extracted["Sex"] = int(
            sex_match.group(1)
        )

    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    education_match = re.search(
        r"education\s*[:\-]?\s*(\d+)",
        text_lower
    )

    if education_match:
        extracted["Education"] = int(
            education_match.group(1)
        )

    # --------------------------------------------------------
    # INCOME
    # --------------------------------------------------------

    income_match = re.search(
        r"income category\s*[:\-]?\s*(\d+)",
        text_lower
    )

    if income_match:
        extracted["Income"] = int(
            income_match.group(1)
        )

    return extracted


def extract_features_from_text(text: str, use_llm: bool = True) -> dict[str, Any]:
    """
    Extract HealthLens ML features from medical report text.
    Combines rule-based regex extraction with OpenRouter LLM intelligence for maximum recall.
    """
    # 1. Rule-based extraction (instant, high-precision pattern matching)
    extracted = extract_features_rule_based(text)

    # 2. LLM semantic extraction (fills in missing context, complex phrasing)
    if use_llm:
        try:
            llm_extracted = extract_features_with_llm(text)
            for key, val in llm_extracted.items():
                if key not in extracted and val is not None:
                    extracted[key] = val
        except Exception as exc:
            print(f"[Extraction] LLM fallback error: {exc}")

    return extracted


def extract_features_from_file(file_path: Path, use_llm: bool = True) -> dict[str, Any]:
    """
    Extract features from any supported medical report file format (.docx, .pdf, .png, .jpg, .jpeg, .webp).
    """
    from app.services.document_service import extract_text_from_file
    from app.services.llm_service import extract_from_image_with_vision_llm

    ext = file_path.suffix.lower()

    if ext in {".png", ".jpg", ".jpeg", ".webp"}:
        # Multimodal Vision processing for images
        vision_result = extract_from_image_with_vision_llm(file_path)
        features = vision_result.get("features", {})
        raw_text = vision_result.get("raw_text", "")

        # Also run rule-based regex over transcribed text to supplement features
        if raw_text:
            rule_features = extract_features_rule_based(raw_text)
            for k, v in rule_features.items():
                if k not in features and v is not None:
                    features[k] = v
        return features

    # For PDF and DOCX: Extract document text, then apply rule-based + LLM extractors
    text = extract_text_from_file(file_path)
    return extract_features_from_text(text, use_llm=use_llm)


