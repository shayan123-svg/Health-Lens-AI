import json
import joblib
import pandas as pd
from pathlib import Path


# ==========================================
# PATHS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_DIR = BASE_DIR / "Model_Pickle_Files"

MODEL_PATH = MODEL_DIR / "diabetes_risk_model.pkl"
FEATURE_ORDER_PATH = MODEL_DIR / "feature_order.json"
MODEL_CONFIG_PATH = MODEL_DIR / "model_config.json"
FEATURE_METADATA_PATH = MODEL_DIR / "feature_metadata.json"


# ==========================================
# LOAD MODEL ARTIFACTS
# ==========================================

print("Loading HealthLens ML model...")

model = joblib.load(MODEL_PATH)

with open(FEATURE_ORDER_PATH, "r") as f:
    FEATURE_ORDER = json.load(f)

with open(MODEL_CONFIG_PATH, "r") as f:
    MODEL_CONFIG = json.load(f)

FEATURE_METADATA: dict = {}
if FEATURE_METADATA_PATH.exists():
    with open(FEATURE_METADATA_PATH, "r") as f:
        FEATURE_METADATA = json.load(f)

SCREENING_THRESHOLD = MODEL_CONFIG["screening_threshold"]

print("Model loaded successfully!")


# ==========================================
# NEUTRAL BASELINE FOR ATTRIBUTION
# ==========================================

# A "neutral" reference profile used to measure how much each of the user's
# actual feature values moves the risk estimate relative to a healthy/default
# baseline. This yields genuine model-derived attribution (finite-difference
# per feature) instead of hardcoded importance scores.
BASELINE_FEATURES = {
    "HighBP": 0,
    "HighChol": 0,
    "CholCheck": 1,
    "BMI": 25.0,
    "Smoker": 0,
    "Stroke": 0,
    "HeartDiseaseorAttack": 0,
    "PhysActivity": 1,
    "Fruits": 1,
    "Veggies": 1,
    "HvyAlcoholConsump": 0,
    "AnyHealthcare": 1,
    "NoDocbcCost": 0,
    "GenHlth": 3,
    "MentHlth": 0,
    "PhysHlth": 0,
    "DiffWalk": 0,
    "Sex": 1,
    "Age": 7,
    "Education": 4,
    "Income": 5,
}


# ==========================================
# RISK CATEGORY
# ==========================================

def get_risk_category(probability: float) -> str:
    """
    Convert predicted probability into
    a user-friendly risk category.

    These categories are for screening/reporting
    and are not a medical diagnosis.
    """

    if probability < 0.10:
        return "Low"

    elif probability < SCREENING_THRESHOLD:
        return "Moderate"

    elif probability < 0.50:
        return "High"

    else:
        return "Very High"


# ==========================================
# FEATURE VALIDATION
# ==========================================

def validate_features(features: dict):
    """
    Ensure that all required ML features
    are present.
    """

    missing_features = [
        feature
        for feature in FEATURE_ORDER
        if feature not in features
    ]

    if missing_features:
        raise ValueError(
            f"Missing required features: {missing_features}"
        )


# ==========================================
# CORE PROBABILITY HELPER
# ==========================================

def _predict_probability(features: dict) -> float:
    """
    Build the model input in the exact required feature order and
    return the calibrated positive-class probability.
    """

    input_data = pd.DataFrame(
        [[features[feature] for feature in FEATURE_ORDER]],
        columns=FEATURE_ORDER,
    )

    return float(model.predict_proba(input_data)[0][1])


# ==========================================
# FEATURE CONTRIBUTIONS
# ==========================================

def compute_feature_contributions(features: dict) -> list[dict]:
    """
    Estimate each feature's contribution to the risk estimate by comparing
    the actual prediction against a counterfactual where that single feature
    is set to its neutral baseline value. The difference (in probability
    points) is a genuine, model-derived attribution score.

    Returns a list sorted by absolute impact (largest first). Never raises —
    attribution is best-effort and must not break the core prediction.
    """

    try:
        actual_probability = _predict_probability(features)

        contributions = []

        for feature in FEATURE_ORDER:
            baseline_value = BASELINE_FEATURES.get(feature)
            user_value = features.get(feature)

            # Skip features that already match the baseline — they contribute ~0.
            if baseline_value is None or user_value == baseline_value:
                continue

            counterfactual = dict(features)
            counterfactual[feature] = baseline_value

            counterfactual_probability = _predict_probability(counterfactual)

            impact = actual_probability - counterfactual_probability

            # Ignore negligible numerical noise
            if abs(impact) < 0.001:
                continue

            display_name = FEATURE_METADATA.get(feature, {}).get(
                "display_name", feature
            )

            contributions.append({
                "feature": feature,
                "display_name": display_name,
                "value": user_value,
                # Positive impact means this feature raises risk vs baseline.
                "risk_impact": round(impact, 4),
                "direction": "increases_risk" if impact > 0 else "decreases_risk",
            })

        contributions.sort(key=lambda item: abs(item["risk_impact"]), reverse=True)

        return contributions

    except Exception as exc:
        print(f"[Prediction] Feature contribution computation failed: {exc}")
        return []


# ==========================================
# PREDICTION FUNCTION
# ==========================================

def predict_diabetes_risk(features: dict) -> dict:
    """
    Takes a dictionary containing the 21
    required ML features and returns
    a structured prediction.
    """

    # Validate required features
    validate_features(features)

    # Generate calibrated probability
    probability = _predict_probability(features)

    # Convert to percentage
    risk_percentage = round(
        probability * 100,
        2
    )

    # Determine risk category
    risk_category = get_risk_category(probability)

    # Screening decision
    screening_positive = (
        probability >= SCREENING_THRESHOLD
    )

    # Model-derived per-feature attribution (best-effort)
    feature_contributions = compute_feature_contributions(features)

    return {
        "risk_probability": round(probability, 6),
        "risk_percentage": risk_percentage,
        "screening_threshold": SCREENING_THRESHOLD,
        "screening_positive": screening_positive,
        "risk_category": risk_category,
        "model_version": MODEL_CONFIG["model_version"],
        "feature_contributions": feature_contributions,
    }
