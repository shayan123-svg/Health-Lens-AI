# 🩺 HealthLens AI: Multimodal Preventive Health Screening & Clinical Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://python.org)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **HealthLens AI** transforms unstructured, fragmented medical documents (PDFs, DOCX, lab report photos) into calibrated, explainable chronic disease risk assessments. Powered by clinical machine learning validated on 250,000+ CDC patient records, vision-enabled multimodal extraction, and a grounded conversational clinical assistant.

---

## 🚀 One-Command Launch (Docker)

To build and launch the entire application (Frontend + Backend + ML Inference Engine) in a single command, ensure Docker is running and execute:

```bash
docker compose up --build
```

- **Frontend Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Healthcheck**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📌 Executive Summary

### 1. The Problem We Are Solving (Who It Affects)
* **The Silent Epidemic**: Over **537 million adults** live with diabetes worldwide, and more than **1 in 3 adults** have prediabetes. Over **80% do not know they have it** until severe microvascular and cardiovascular damage has occurred.
* **The Paperwork Chasm**: Critical clinical biomarkers are buried in unstructured formats—photocopied lab sheets, PDFs, and clinic notes—leading to delayed screening and missed early intervention windows.
* **The Burden on Clinicians & Patients**: Primary care doctors lack time to aggregate 20+ disparate lifestyle and laboratory data points, while patients struggle to interpret cryptic lab values without anxiety.

### 2. Our Solution (The Audience It Serves)
**HealthLens AI** is an intelligent screening and clinical support ecosystem serving:
1. **Individuals & At-Risk Patients**: Enables individuals to snap a photo or upload existing lab reports to receive an instant, plain-English risk profile with actionable lifestyle steps.
2. **Clinicians & Primary Care Providers**: Delivers an automated clinical dossier with exact biomarker attributions, saving 15+ minutes of record aggregation per patient consultation.
3. **Corporate Wellness & Public Health Screeners**: Offers high-throughput, low-cost proactive screening for populations before chronic diseases escalate into hospitalizations.

### 3. Real-World Need & Impact
* **Early Detection Saves Lives**: Detecting prediabetes early enables lifestyle modifications that reduce type 2 diabetes progression by **58%** (CDC DPP trial).
* **Democratizing Diagnostic Literacy**: Converts confusing numbers (A1C, Fasting Blood Glucose, BMI, Lipid panels) into clear visual risk trajectories.
* **Zero Medical Jargon Barrier**: An embedded clinical assistant explains each finding empathetically, answering patient questions within the context of their specific biomarkers.

---

## 🔬 Core Innovations & Technology Architecture

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Next.js 16 Web Portal                   │
                  │  (React 19, Tailwind v4, Recharts, Clerk Authentication) │
                  └───────────────────────────┬─────────────────────────────┘
                                              │ REST API / JSON
                                              ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                   FastAPI Backend API                   │
                  │    (Asynchronous Endpoints, CORS, Supabase Persistence)  │
                  └─────────────┬─────────────────────────────┬─────────────┘
                                │                             │
        ┌───────────────────────┴──────────┐       ┌──────────┴───────────────────────┐
        ▼                                  ▼       ▼                                  ▼
┌───────────────┐                  ┌───────────────┐ ┌───────────────┐        ┌───────────────┐
│ Multimodal    │                  │ Calibrated ML │ │ Counterfactual│        │ Grounded LLM  │
│ Document AI   │                  │ Risk Engine   │ │ Attribution   │        │ Assistant     │
│ (PyPDF, DOCX, │                  │ (HistGradient │ │ (Finite Diff. │        │ (OpenRouter,  │
│ Vision LLMs)  │                  │ + Isotonic)   │ │ Baseline XAI) │        │ Gemma/Nemotr.)│
└───────────────┘                  └───────────────┘ └───────────────┘        └───────────────┘
```

### 1. Hybrid Multimodal Ingestion Pipeline
Unlike naive OCR tools, HealthLens combines:
* **Rule-based Clinical Regex Parsers**: Instantly extracts deterministic lab patterns (BMI, Hypertension, Smoking status, Physical health days).
* **Multimodal Vision LLMs**: Processes scanned prescriptions and photo lab tests, converting dense tabular data into structured clinical parameters.
* **Missing Feature Q&A Flow**: If a medical document lacks key indicators (e.g. daily vegetable intake or physical activity), the platform dynamically queries the patient to guarantee 100% feature completeness before inference.

### 2. Calibrated Clinical ML Inference Engine
* **Dataset**: Trained on the CDC **BRFSS** (Behavioral Risk Factor Surveillance System) dataset spanning 253,680 individual clinical profiles across 21 indicators.
* **Model Family**: `HistGradientBoostingClassifier` optimized with hyperparameter sweeps for non-linear interactions across metabolic, demographic, and lifestyle indicators.
* **Isotonic Probability Calibration**: Raw machine learning classification models suffer from overconfident probabilities. We calibrated the model via **Isotonic Regression**, producing true clinical probabilities aligned with empirical risk.
* **Calibrated Decision Threshold**: Set at **`0.24`** to prioritize high sensitivity (recall) for early preventive screening, catching at-risk patients before symptoms manifest.
* **External Validation**: Validated against unseen multi-year datasets (BRFSS 2021) to safeguard against data drift and demographic bias.

### 3. Model-Derived Counterfactual Feature Attribution
Rather than returning an opaque black-box percentage, HealthLens calculates **individualized feature attribution** using finite-difference counterfactual modeling against a calibrated neutral baseline:
$$\Delta \text{Risk}_i = P(\mathbf{x}) - P(\mathbf{x}_{i \leftarrow \text{baseline}})$$
This isolates the exact percentage impact that each specific risk factor (e.g., elevated BMI or untreated hypertension) contributes to the patient's score.

### 4. Interactive Context-Grounded Clinical AI Assistant
Integrated health assistant powered by OpenRouter multi-model fallbacks (Gemma-4, Nemotron-3.5) with strict clinical grounding. The assistant receives the patient's verified biomarkers, prediction category, and feature attributions to provide tailored, empathetic, evidence-based guidance.

---

## 🛠️ Full Tech Stack

| Layer | Technologies | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI** | **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4** | Responsive portal, modern dashboards, dark mode, accessible UI |
| **Data Viz** | **Recharts**, **Lucide React** | Interactive risk gauges, biomarker impact breakdowns, history charts |
| **Authentication** | **Clerk** | Secure JWT verification, user sign-up/login, session management |
| **Backend API** | **FastAPI**, **Uvicorn**, **Pydantic v2** | High-throughput asynchronous REST API, request schema validation |
| **Machine Learning** | **Scikit-Learn**, **Pandas**, **NumPy**, **Joblib**, **SHAP** | HistGradientBoosting model, Isotonic calibration, feature attribution |
| **Document AI** | **PyPDF**, **python-docx**, **Pillow**, **OpenRouter Vision** | Multimodal PDF, Word DOCX, and image clinical parsing |
| **Generative AI** | **OpenRouter API** (Gemma, Nemotron models) | Clinical report synthesis and grounded interactive assistant |
| **Persistence** | **Supabase (PostgreSQL)** | Historical report tracking, structured feature logs, user profiles |
| **DevOps** | **Docker**, **Docker Compose** | One-command local container orchestration, multi-stage images |

---

## 📂 Project Repository Structure

```
Health-Lens-AI/
├── docker-compose.yml              # Single-command multi-container orchestration
├── DOCKERFILE                      # Unified all-in-one container fallback
├── .dockerignore                   # Docker build context optimizations
├── .gitignore                      # Environment and cache ignore rules
├── README.md                       # Master project overview & documentation
├── HealthLens_AI_Presentation.pptx # Executive PowerPoint presentation deck
│
├── Docs/                           # In-depth architectural & technical documentation
│   ├── ARCHITECTURE.md             # System architecture, data flow & security
│   ├── API_REFERENCE.md            # REST API endpoints, schemas & examples
│   ├── ML_MODEL_SPEC.md            # Data science, calibration & SHAP analysis
│   ├── DEPLOYMENT_GUIDE.md         # Production deployment (Render, Vercel, Supabase)
│   ├── PRESENTATION.md             # Slide-by-slide speaker notes & pitch script
│   └── presentation.html           # Interactive HTML5 presentation web app
│
├── Backend/                        # FastAPI REST API & Clinical ML Service
│   ├── Dockerfile                  # Python 3.11 slim production container
│   ├── requirements.txt            # Python dependencies (FastAPI, Scikit-Learn, SHAP)
│   ├── render.yaml                 # Cloud deployment specification
│   ├── app/
│   │   ├── main.py                 # FastAPI application entrypoint & CORS config
│   │   ├── api/v1/                 # Endpoints: auth.py, reports.py, assistant.py
│   │   ├── core/                   # Security, Clerk auth middleware, config
│   │   ├── schemas/                # Pydantic data schemas & request validators
│   │   └── services/               # Extraction, ML prediction, LLM, document parsing
│   └── Model_Pickle_Files/         # Serialized ML model, metadata & feature orders
│
├── frontend/                       # Next.js 16 + React 19 Frontend Web Application
│   ├── Dockerfile                  # Multi-stage production container build
│   ├── package.json                # Dependencies: Clerk, Recharts, Tailwind v4
│   ├── app/                        # App Router: dashboard, reports, assistant, upload
│   ├── components/                 # Reusable UI components, cards, navigation
│   └── lib/                        # API client, utility functions, auth helpers
│
└── Machine_Learning_Model/         # Data Science & Model Training Workspace
    ├── notebooks/                  # EDA, baseline models, tuning & calibration
    ├── results/                    # SHAP importance scores & evaluation logs
    └── pyproject.toml              # Model development environment
```

---

## ⚡ Manual Local Development Setup

If you prefer to run services individually without Docker:

### 1. Prerequisites
- **Python**: 3.11+
- **Node.js**: 20+ (or **Bun** 1.3+)
- Optional: Clerk & Supabase accounts (fallbacks are active for local dev)

### 2. Backend Setup
```bash
cd Backend

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env to add OPENROUTER_API_KEY, SUPABASE_URL, etc.

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
bun install   # or: npm install

# Configure environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start Next.js development server
bun dev       # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | API status and health check |
| `POST` | `/api/v1/reports/upload` | Upload medical document (PDF, DOCX, Image) for parsing & risk scoring |
| `POST` | `/api/v1/reports/text` | Submit raw medical text for instant risk analysis |
| `GET` | `/api/v1/reports/` | List authenticated user's screening history |
| `GET` | `/api/v1/reports/{id}` | Fetch detailed screening report with feature attributions |
| `PUT` | `/api/v1/reports/{id}` | Update missing clinical features and recalculate calibrated risk |
| `DELETE`| `/api/v1/reports/{id}` | Delete screening report and associated records |
| `POST` | `/api/v1/assistant/chat` | Interactive clinical assistant chat grounded in screening results |

*(See [`Docs/API_REFERENCE.md`](Docs/API_REFERENCE.md) for complete request/response schemas and curl examples).*

---

## 🛡️ Privacy, Security & Disclaimers

* **Medical Disclaimer**: HealthLens AI is a clinical risk screening and health literacy tool designed for early preventive education. It does not provide medical diagnoses or prescribe treatments. Users should always consult qualified healthcare providers for clinical diagnosis.
* **Data Privacy**: Uploaded medical files are processed ephemerally in memory or within sandboxed temporary storage. In production, row-level security (RLS) and encrypted tokens protect user screening data.

---

## 👥 Team & Acknowledgments
Built for the Hackathon with ❤️ by the **HealthLens AI** Team.
- **Dataset Source**: CDC BRFSS (Behavioral Risk Factor Surveillance System)
- **GitHub Repository**: [https://github.com/shayan123-svg/Health-Lens-AI.git](https://github.com/shayan123-svg/Health-Lens-AI.git)
