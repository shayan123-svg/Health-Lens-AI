# HealthLens AI - REST API Reference & Specification

Base URL: `http://localhost:8000` (Local) / `https://<your-render-domain>.onrender.com` (Production)

All API responses return JSON format. Authenticated endpoints expect a valid Clerk JWT Bearer token in the `Authorization` header:
```http
Authorization: Bearer <clerk_jwt_token>
```

---

## 1. System Health & Status

### `GET /health`
Returns service health status for Docker and orchestrator health checks.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "HealthLens AI API"
}
```

---

## 2. Authentication & User Profile

### `POST /api/v1/auth/sync`
Synchronizes the user profile between Clerk and Supabase. Creates or updates the user record with the latest timestamp.

**Headers**:
- `Authorization: Bearer <clerk_token>` (Required)

**Response `200 OK`**:
```json
{
  "status": "synced",
  "user": {
    "user_id": "user_2test123",
    "email": "patient@example.com",
    "full_name": "Jane Doe",
    "last_seen_at": "2026-09-03T09:44:00Z"
  }
}
```

---

## 3. Screening Reports API

### `GET /api/v1/reports/`
Lists all screening reports belonging to the authenticated user, ordered with newest first.

**Headers**:
- `Authorization: Bearer <clerk_token>`

**Response `200 OK`**:
```json
{
  "reports": [
    {
      "report_id": "6c49e798-8e6d-4b51-9e77-9df0ef620e29",
      "filename": "annual_lab_bloodwork.pdf",
      "file_type": "application/pdf",
      "status": "completed",
      "risk_percentage": 28.45,
      "risk_category": "High",
      "created_at": "2026-09-03T08:15:20Z"
    }
  ],
  "total": 1
}
```

---

### `POST /api/v1/reports/upload`
Uploads a medical report document or image file. Automatically extracts text, identifies 21 clinical parameters, and executes calibrated ML risk screening.

**Content-Type**: `multipart/form-data`
**Supported Formats**: `.pdf`, `.docx`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.webp` (Max size: 10MB)

**Form Data Parameters**:
- `file`: Binary file upload

**Response `201 Created` (When all features are found)**:
```json
{
  "report_id": "6c49e798-8e6d-4b51-9e77-9df0ef620e29",
  "filename": "annual_lab_bloodwork.pdf",
  "file_type": ".pdf",
  "status": "completed",
  "extracted_features": {
    "HighBP": 1,
    "HighChol": 1,
    "CholCheck": 1,
    "BMI": 31.2,
    "Smoker": 0,
    "Stroke": 0,
    "HeartDiseaseorAttack": 0,
    "PhysActivity": 0,
    "Fruits": 1,
    "Veggies": 1,
    "HvyAlcoholConsump": 0,
    "AnyHealthcare": 1,
    "NoDocbcCost": 0,
    "GenHlth": 3,
    "MentHlth": 2,
    "PhysHlth": 4,
    "DiffWalk": 0,
    "Sex": 0,
    "Age": 8,
    "Education": 5,
    "Income": 6
  },
  "prediction": {
    "risk_probability": 0.3142,
    "risk_percentage": 31.42,
    "screening_threshold": 0.24,
    "screening_positive": true,
    "risk_category": "High",
    "model_version": "1.0",
    "feature_contributions": [
      {
        "feature": "HighBP",
        "display_name": "High Blood Pressure",
        "value": 1,
        "risk_impact": 0.114,
        "direction": "increases_risk"
      },
      {
        "feature": "BMI",
        "display_name": "Body Mass Index",
        "value": 31.2,
        "risk_impact": 0.082,
        "direction": "increases_risk"
      },
      {
        "feature": "PhysActivity",
        "display_name": "Physical Activity",
        "value": 0,
        "risk_impact": 0.035,
        "direction": "increases_risk"
      }
    ]
  },
  "ai_recommendations": "### HealthLens Clinical Assessment\n\n- **Risk Level**: High (31.42%)...",
  "missing_features": []
}
```

**Response `201 Created` (When features are missing - `needs_info`)**:
```json
{
  "report_id": "6c49e798-8e6d-4b51-9e77-9df0ef620e29",
  "filename": "partial_vitals.docx",
  "file_type": ".docx",
  "status": "needs_info",
  "extracted_features": {
    "BMI": 26.5,
    "HighBP": 0
  },
  "missing_features": [
    {
      "feature_key": "PhysActivity",
      "question": "Have you participated in any physical activity or exercise in the past 30 days?",
      "options": [{"label": "Yes", "value": 1}, {"label": "No", "value": 0}],
      "type": "binary"
    }
  ],
  "prediction": null
}
```

---

### `POST /api/v1/reports/text`
Submits raw clinical text directly without uploading a file.

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <clerk_token>`

**Request Body**:
```json
{
  "text": "Patient is a 54-year-old male with a history of hypertension and hyperlipidemia. Current BMI is 29.1. Reports no history of stroke or heart attack. Exercised regularly in the past month. Does not smoke."
}
```

---

### `GET /api/v1/reports/{report_id}`
Retrieves complete details of a single report, including raw extracted text, verified features, calibrated prediction, counterfactual impact breakdown, and AI recommendations.

**Headers**:
- `Authorization: Bearer <clerk_token>`

---

### `PUT /api/v1/reports/{report_id}`
Updates clinical features for a report (e.g. answering missing questions) and automatically recalculates the calibrated ML prediction and insights.

**Request Body**:
```json
{
  "features": {
    "PhysActivity": 1,
    "Fruits": 1,
    "Veggies": 1,
    "HvyAlcoholConsump": 0,
    "GenHlth": 2
  }
}
```

---

### `DELETE /api/v1/reports/{report_id}`
Deletes a report and any associated stored data.

**Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Report 6c49e798-8e6d-4b51-9e77-9df0ef620e29 deleted successfully"
}
```

---

## 4. AI Clinical Assistant API

### `POST /api/v1/assistant/chat`
Converses with the grounded clinical health assistant. Grounding allows the assistant to answer questions using the patient's specific lab results without hallucinating generalities.

**Request Body**:
```json
{
  "question": "What is the biggest factor contributing to my high risk category, and what can I do about it this week?",
  "context": {
    "risk_category": "High",
    "risk_percentage": 31.42,
    "features": {
      "BMI": 31.2,
      "HighBP": 1,
      "PhysActivity": 0
    },
    "top_risk_drivers": ["High Blood Pressure (+11.4%)", "Elevated BMI (+8.2%)"]
  },
  "history": [
    {"role": "user", "content": "Can you explain my report?"},
    {"role": "assistant", "content": "Your report indicates a 31.4% probability..."}
  ]
}
```

**Response `200 OK`**:
```json
{
  "reply": "### 1. Primary Risk Driver: High Blood Pressure\n\nBased on your assessment, **Elevated Blood Pressure** adds approximately **+11.4%** to your total risk estimate...\n\n### 2. Immediate Action Steps for This Week:\n- **Dietary Sodium Reduction**: Aim for under 2,000 mg of sodium per day.\n- **Brisk Walking**: Start with 20-30 minutes daily.\n- **Primary Care Follow-up**: Schedule an in-person blood pressure check.\n\n*Disclaimer: Educational screening insights only. Please consult a qualified doctor for medical prescriptions or clinical decisions.*"
}
```
