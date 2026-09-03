import base64
import json
import mimetypes
import os
from pathlib import Path
from typing import Any
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

# OpenRouter / LLM Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1/chat/completions")
DEFAULT_MODEL = os.getenv("LLM_MODEL", "openrouter/free")
FALLBACK_MODELS = [
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "openai/gpt-oss-20b:free",
    "nvidia/nemotron-3.5-lightning:free",
]
VISION_MODELS = [
    "openrouter/free",
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
]


def _prepare_optimized_image_b64(image_path: Path, max_dim: int = 1400) -> tuple[str, str]:
    """
    Compress and resize large uploaded medical images so they transfer in seconds and prevent timeouts.
    """
    try:
        from PIL import Image
        import io

        with Image.open(image_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            w, h = img.size
            if max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                new_size = (int(w * scale), int(h * scale))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=85, optimize=True)
            return base64.b64encode(buffer.getvalue()).decode("utf-8"), "image/jpeg"
    except Exception:
        mime_type, _ = mimetypes.guess_type(str(image_path))
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode("utf-8"), mime_type or "image/jpeg"


def _call_openrouter(
    messages: list[dict[str, Any]],
    model: str = DEFAULT_MODEL,
    models_override: list[str] | None = None,
    timeout_per_model: int = 15,
    temperature: float = 0.2
) -> str:
    """Helper function to call OpenRouter / OpenAI-compatible API with fast multi-model fallback."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY or OPENAI_API_KEY is not configured in environment.")

    if models_override:
        candidate_models = models_override
    else:
        candidate_models = [model] + [m for m in FALLBACK_MODELS if m != model]

    last_err = None

    for cand_model in candidate_models:
        payload = {
            "model": cand_model,
            "messages": messages,
            "temperature": temperature,
        }

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://healthlens.ai",
            "X-Title": "HealthLens AI",
            "User-Agent": "HealthLensAI/1.0",
        }

        req = urllib.request.Request(
            OPENROUTER_BASE_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=timeout_per_model) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            last_err = e
            continue

    raise last_err if last_err else RuntimeError("Failed to query LLM")


def extract_features_with_llm(text: str) -> dict[str, Any]:
    """
    Extract structured health features from unstructured medical reports using LLM.
    Returns a dictionary of mapped features (e.g., HighBP, HighChol, BMI, Smoker, Age, Sex, etc.).
    """
    if not OPENROUTER_API_KEY or not text.strip():
        return {}

    system_prompt = (
        "You are an expert clinical data extraction assistant for HealthLens. "
        "Extract the following 21 features from the provided medical text where mentioned:\n"
        "- HighBP: 1 (yes/hypertension) or 0 (no/normal)\n"
        "- HighChol: 1 (high cholesterol) or 0 (normal)\n"
        "- CholCheck: 1 (checked in past 5 years) or 0\n"
        "- BMI: numeric float value (e.g. 27.5)\n"
        "- Smoker: 1 (smoked >= 100 cigarettes in lifetime) or 0\n"
        "- Stroke: 1 (history of stroke) or 0\n"
        "- HeartDiseaseorAttack: 1 (coronary heart disease or myocardial infarction) or 0\n"
        "- PhysActivity: 1 (physical activity in past 30 days) or 0\n"
        "- Fruits: 1 (consumes fruit 1+ times per day) or 0\n"
        "- Veggies: 1 (consumes vegetables 1+ times per day) or 0\n"
        "- HvyAlcoholConsump: 1 (heavy drinker: adult men >14 drinks/week, women >7) or 0\n"
        "- AnyHealthcare: 1 (has health coverage) or 0\n"
        "- NoDocbcCost: 1 (could not see doctor due to cost in past 12m) or 0\n"
        "- GenHlth: 1 (Excellent), 2 (Very Good), 3 (Good), 4 (Fair), 5 (Poor)\n"
        "- MentHlth: number of days in past 30 with poor mental health (0-30)\n"
        "- PhysHlth: number of days in past 30 with physical illness/injury (0-30)\n"
        "- DiffWalk: 1 (serious difficulty walking/climbing stairs) or 0\n"
        "- Sex: 1 (Male) or 0 (Female)\n"
        "- Age: integer category (1: 18-24, 2: 25-29, 3: 30-34, 4: 35-39, 5: 40-44, 6: 45-49, 7: 50-54, 8: 55-59, 9: 60-64, 10: 65-69, 11: 70-74, 12: 75-79, 13: 80+)\n"
        "- Education: 1-6 scale\n"
        "- Income: 1-8 scale\n\n"
        "Return ONLY a valid JSON object containing only keys that were explicitly found or strongly implied. "
        "Do not guess missing values. Do not wrap in markdown codeblocks if possible, or use standard ```json."
    )

    try:
        response_text = _call_openrouter([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Medical Report:\n\"\"\"\n{text}\n\"\"\""}
        ], timeout_per_model=15)

        # Clean markdown codeblocks if present
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.split("\n", 1)[-1]
            if clean_text.endswith("```"):
                clean_text = clean_text.rsplit("```", 1)[0]
            clean_text = clean_text.strip()

        data = json.loads(clean_text)
        if isinstance(data, dict):
            return data
    except Exception as e:
        print(f"[LLM Extraction Error]: {e}")

    return {}


def extract_from_image_with_vision_llm(image_path: Path) -> dict[str, Any]:
    """
    Extract both raw text and 21 clinical features directly from a medical image (PNG, JPG, JPEG, WEBP)
    or scanned medical lab panel using multimodal vision models.
    """
    if not OPENROUTER_API_KEY or not image_path.exists():
        return {"raw_text": "", "features": {}}

    b64_data, mime_type = _prepare_optimized_image_b64(image_path)

    prompt = (
        "You are HealthLens Clinical Vision AI. Analyze this medical document, lab report, or prescription image.\n\n"
        "Tasks:\n"
        "1. Extract/transcribe all visible clinical text, lab parameters, test results, vitals (BP, glucose, cholesterol, BMI), "
        "diagnoses, and notes into 'raw_text'.\n"
        "2. Extract any of the following 21 features into a 'features' dictionary where found:\n"
        "   HighBP (0 or 1), HighChol (0 or 1), CholCheck (0 or 1), BMI (float), Smoker (0 or 1), Stroke (0 or 1), "
        "   HeartDiseaseorAttack (0 or 1), PhysActivity (0 or 1), Fruits (0 or 1), Veggies (0 or 1), HvyAlcoholConsump (0 or 1), "
        "   AnyHealthcare (0 or 1), NoDocbcCost (0 or 1), GenHlth (1-5), MentHlth (0-30), PhysHlth (0-30), DiffWalk (0 or 1), "
        "   Sex (1 for Male, 0 for Female), Age (category 1-13).\n\n"
        "Return ONLY a JSON object in this exact format:\n"
        "{\n"
        '  "raw_text": "Extracted clinical text here...",\n'
        '  "features": {\n'
        '    "HighBP": 1,\n'
        '    "BMI": 28.4\n'
        "  }\n"
        "}"
    )

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{b64_data}"
                    }
                }
            ]
        }
    ]

    try:
        response_text = _call_openrouter(
            messages,
            models_override=VISION_MODELS,
            timeout_per_model=15,
            temperature=0.2
        )
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.split("\n", 1)[-1]
            if clean_text.endswith("```"):
                clean_text = clean_text.rsplit("```", 1)[0]
            clean_text = clean_text.strip()

        data = json.loads(clean_text)
        if isinstance(data, dict):
            return {
                "raw_text": data.get("raw_text", ""),
                "features": data.get("features", {}) if isinstance(data.get("features"), dict) else {}
            }
    except Exception as e:
        print(f"[Vision LLM Error]: {e}")

    return {"raw_text": "", "features": {}}


def generate_medical_insights(features: dict[str, Any], prediction: dict[str, Any]) -> str:
    """
    Generate personalized clinical analysis, risk factors breakdown, and actionable lifestyle recommendations.
    """
    if not OPENROUTER_API_KEY:
        risk_cat = prediction.get("risk_category", "Unknown")
        risk_pct = prediction.get("risk_percentage", 0.0)
        return (
            f"### HealthLens Clinical Assessment\n\n"
            f"- **Overall Risk**: {risk_cat} ({risk_pct}% predicted probability)\n"
            f"- **Key Metrics Evaluated**: BMI={features.get('BMI', 'N/A')}, "
            f"High BP={'Yes' if features.get('HighBP') == 1 else 'No' if features.get('HighBP') == 0 else 'N/A'}, "
            f"High Cholesterol={'Yes' if features.get('HighChol') == 1 else 'No' if features.get('HighChol') == 0 else 'N/A'}.\n\n"
            f"**Recommendation**: Please consult with a healthcare professional to review these findings and discuss preventative strategies."
        )

    system_prompt = (
        "You are HealthLens Clinical Insights AI, a preventive medicine AI specialist. "
        "Based on patient screening features and ML risk assessment, generate a clear, professional, "
        "empathetic markdown report. Include:\n"
        "1. Executive Summary: Risk level and primary drivers.\n"
        "2. Clinical Risk Analysis: Discuss specific biomarkers/habits (BMI, Blood Pressure, Activity, etc.).\n"
        "3. Actionable Prevention Plan: Nutrition, exercise, lifestyle modifications, and medical follow-ups.\n"
        "Keep it structured with markdown headings and bullet points. Include standard medical disclaimer at the end."
    )

    user_content = (
        f"Patient Features:\n{json.dumps(features, indent=2)}\n\n"
        f"Machine Learning Model Assessment:\n{json.dumps(prediction, indent=2)}"
    )

    try:
        return _call_openrouter([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ], temperature=0.3)
    except Exception as e:
        print(f"[LLM Insights Error]: {e}")
        return (
            f"### Assessment Summary\n\n"
            f"Risk Level: **{prediction.get('risk_category', 'Assessed')}** ({prediction.get('risk_percentage', 0)}%). "
            f"Please review your full clinical parameters with your primary care provider."
        )


def chat_with_assistant(
    question: str,
    context: dict[str, Any] | None = None,
    history: list[dict[str, str]] | None = None
) -> str:
    """
    Interactive assistant conversation answering user questions grounded in screening context.
    """
    if not OPENROUTER_API_KEY:
        return "The AI Health Assistant is currently unavailable. Please verify API configuration."

    system_prompt = (
        "You are the HealthLens AI Health Assistant. You provide helpful, evidence-based, compassionate health "
        "and wellness guidance based on the patient's screening context and risk assessment.\n\n"
        "Formatting & Structure Rules:\n"
        "- Structure your answer with clear markdown headings (e.g. '### 1. ...'), short paragraphs, and concise bullet points.\n"
        "- Put blank lines between paragraphs and sections so the layout is clean and scannable.\n"
        "- Bold key medical terms, lab tests, and actions (e.g. **A1C**, **Blood Pressure**, **BMI**).\n"
        "- Ground your responses in the patient's provided context when available.\n"
        "- Explain clinical concepts in simple, clear, empowering language.\n"
        "- Always include a standard brief disclaimer at the end (*Disclaimer: Educational screening insights only. Please consult a qualified doctor for medical prescriptions or clinical decisions.*)."
    )

    messages = [{"role": "system", "content": system_prompt}]

    if context:
        messages.append({
            "role": "system",
            "content": f"Active Patient Context:\n{json.dumps(context, indent=2)}"
        })

    if history:
        for turn in history[-8:]:
            messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": question})

    try:
        return _call_openrouter(messages, temperature=0.5)
    except Exception as e:
        print(f"[LLM Assistant Error]: {e}")
        return "I'm sorry, I encountered an issue processing your question right now. Please try again in a moment."
