import json
from pathlib import Path


# ==========================================
# PATHS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_DIR = BASE_DIR / "Model_Pickle_Files"

FEATURE_ORDER_PATH = MODEL_DIR / "feature_order.json"


# ==========================================
# LOAD FEATURE ORDER
# ==========================================

with open(FEATURE_ORDER_PATH, "r") as f:
    FEATURE_ORDER = json.load(f)


# ==========================================
# MISSING FEATURE DETECTION
# ==========================================

def get_missing_features(extracted_features: dict) -> list[str]:
    """
    Compare extracted features against the
    21 features required by the ML model.
    """

    return [
        feature
        for feature in FEATURE_ORDER
        if feature not in extracted_features
    ]


# ==========================================
# FEATURE COMPLETENESS
# ==========================================

def validate_feature_completeness(
    extracted_features: dict
) -> dict:

    missing_features = get_missing_features(
        extracted_features
    )

    return {
        "complete": len(missing_features) == 0,
        "missing_features": missing_features,
    }


# ==========================================
# FEATURE SANITIZATION
# ==========================================

# Valid ranges per feature, matching Model_Pickle_Files/feature_metadata.json
_FEATURE_RANGES: dict[str, tuple[float, float]] = {
    "BMI": (10.0, 100.0),
    "GenHlth": (1, 5),
    "MentHlth": (0, 30),
    "PhysHlth": (0, 30),
    "Age": (1, 13),
    "Education": (1, 6),
    "Income": (1, 8),
}

_BINARY_FEATURES = {
    "HighBP", "HighChol", "CholCheck", "Smoker", "Stroke",
    "HeartDiseaseorAttack", "PhysActivity", "Fruits", "Veggies",
    "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost", "DiffWalk",
    "Sex",
}

_TRUTHY = {"1", "true", "yes", "y", "present", "positive"}
_FALSY = {"0", "false", "no", "n", "absent", "negative", "normal"}


def _coerce_binary(value):
    """Coerce LLM/user values like 'yes', True, 1.0 into 0/1 ints."""

    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        if value in (0, 1):
            return int(value)
        return None
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in _TRUTHY:
            return 1
        if normalized in _FALSY:
            return 0
    return None


def _coerce_number(value):
    """Coerce numeric-looking values into int/float."""

    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return value
    if isinstance(value, str):
        try:
            return float(value.strip())
        except ValueError:
            return None
    return None


def sanitize_features(features: dict) -> dict:
    """
    Clean a raw feature dictionary before it reaches the model:
      - drop keys the model does not use
      - coerce booleans/categoricals to ints, BMI to float
      - enforce per-feature ranges
      - drop any value that cannot be safely coerced

    Works on both rule-based and LLM-extracted features.
    """

    cleaned: dict = {}

    for feature in FEATURE_ORDER:
        if feature not in features:
            continue

        value = features[feature]

        if value is None:
            continue

        if feature in _BINARY_FEATURES:
            coerced = _coerce_binary(value)
            if coerced is not None:
                cleaned[feature] = coerced
            continue

        if feature == "BMI":
            coerced = _coerce_number(value)
            if coerced is None:
                continue
            bmi = float(coerced)
            low, high = _FEATURE_RANGES["BMI"]
            if low <= bmi <= high:
                cleaned[feature] = bmi
            continue

        # Integer categorical / count features
        coerced = _coerce_number(value)
        if coerced is None:
            continue

        integer_value = int(round(coerced))
        low, high = _FEATURE_RANGES[feature]
        if low <= integer_value <= high:
            cleaned[feature] = integer_value

    return cleaned
