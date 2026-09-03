# HealthLens AI - Clinical Machine Learning & Data Science Specification

## 1. Clinical Screening Rationale

Type 2 diabetes mellitus is a chronic metabolic condition characterized by progressive insulin resistance and pancreatic beta-cell dysfunction. Crucially, **prediabetes** develops silently over 5 to 10 years before clinical diabetes is formally diagnosed.

Traditional clinical workflows rely almost exclusively on reactive laboratory thresholds (Fasting Plasma Glucose $\ge 126\text{ mg/dL}$ or $\text{HbA1c} \ge 6.5\%$). However:
1. Patients in underserved or busy environments often miss annual wellness panels.
2. Isolated biometric values fail to capture multi-system risk interactions (e.g. combined effects of age, hypertension, sedentary lifestyle, and BMI).

HealthLens AI implements a proactive, non-invasive screening paradigm that aggregates both physiological and social/behavioral determinants to estimate true individualized risk.

---

## 2. Dataset & Cohort Specifications

* **Primary Training Dataset**: Centers for Disease Control and Prevention (CDC) **BRFSS 2015** (Behavioral Risk Factor Surveillance System).
* **Sample Size**: 253,680 individual adult patient records.
* **Target Label**: `Diabetes_binary`
  - `0`: No diabetes diagnosis.
  - `1`: Diagnosed prediabetes or diabetes.
* **External Validation Cohort**: CDC **BRFSS 2021** (over 200,000 independent unseen patient surveys) used to test for temporal drift and out-of-distribution stability.

---

## 3. The 21 Clinical & Behavioral Features

The model evaluates 21 validated clinical, lifestyle, and socioeconomic variables:

| Feature Key | Description | Type / Range | Clinical Relevance |
| :--- | :--- | :--- | :--- |
| `HighBP` | Clinician-diagnosed hypertension | Binary (0 / 1) | Strong comorbid vascular risk factor |
| `HighChol` | Clinician-diagnosed hypercholesterolemia | Binary (0 / 1) | Atherosclerotic and metabolic syndrome marker |
| `CholCheck` | Cholesterol screening within past 5 years | Binary (0 / 1) | Preventive healthcare engagement proxy |
| `BMI` | Body Mass Index ($\text{kg/m}^2$) | Continuous (12.0 – 98.0) | Key determinant of peripheral insulin resistance |
| `Smoker` | Lifetime consumption $\ge 100$ cigarettes | Binary (0 / 1) | Systemic inflammation and endothelial injury |
| `Stroke` | Prior cerebrovascular accident | Binary (0 / 1) | Vascular disease history |
| `HeartDiseaseorAttack` | Coronary heart disease or MI history | Binary (0 / 1) | Macrovascular complication overlap |
| `PhysActivity` | Any physical activity in past 30 days | Binary (0 / 1) | Muscle glucose uptake & insulin sensitivity |
| `Fruits` | Daily fruit consumption $\ge 1$ time/day | Binary (0 / 1) | Nutritional antioxidant and fiber indicator |
| `Veggies` | Daily vegetable consumption $\ge 1$ time/day | Binary (0 / 1) | Micronutrient & dietary quality marker |
| `HvyAlcoholConsump` | Heavy alcohol consumption (M>14, F>7/wk) | Binary (0 / 1) | Hepatic steatosis and metabolic dysfunction |
| `AnyHealthcare` | Health insurance / clinical coverage | Binary (0 / 1) | Access to preventative care |
| `NoDocbcCost` | Inability to consult doctor due to cost | Binary (0 / 1) | Socioeconomic barrier to early intervention |
| `GenHlth` | Self-reported general health status | Ordinal (1=Exc, 5=Poor) | Broadest subjective biopsychosocial indicator |
| `MentHlth` | Poor mental health days in past 30 days | Integer (0 – 30) | Neuroendocrine stress / cortisol axis |
| `PhysHlth` | Physical injury/illness days in past 30 days | Integer (0 – 30) | Chronic morbidity and systemic frailty |
| `DiffWalk` | Serious mobility impairment / stair difficulty | Binary (0 / 1) | Functional limitation and physical deconditioning |
| `Sex` | Biological sex | Binary (1=Male, 0=Female) | Endocrine and fat distribution distinctions |
| `Age` | Age group category | Ordinal (1=18-24 to 13=80+) | Age-related decline in beta-cell responsiveness |
| `Education` | Highest completed level of education | Ordinal (1 – 6) | Health literacy and preventive lifestyle agency |
| `Income` | Annual household income tier | Ordinal (1 – 8) | Food security, stress, and medical resource access |

---

## 4. Model Architecture & Calibration

### Algorithm Selection
We selected `HistGradientBoostingClassifier` (Scikit-Learn's optimized histogram-based tree booster) over traditional Logistic Regression and Random Forests:
- **Non-Linear Interactions**: Automatically learns non-linear interactions between BMI, age, and blood pressure without manual polynomial feature expansion.
- **Histogram Binning**: High inference speed (sub-millisecond latency per patient), ideal for web deployments.
- **Robustness**: Handles both binary and ordinal demographic variables without requiring complex one-hot scaling that dilutes tree split capacity.

### Isotonic Probability Calibration
Standard ensemble classifiers produce ranking scores that do not reflect true empirical probabilities (e.g., predicted 70% may only correspond to 40% true positive rate in practice).

To make outputs clinically actionable:
1. We trained an `IsotonicRegression` calibrator on hold-out validation fold probabilities.
2. The calibration mapping ensures:
   $$\mathbb{E}[Y \mid \hat{P} = p] \approx p$$
3. Minimizes Brier score and ensures risk percentages can be safely interpreted by patients and healthcare professionals.

### Calibrated Screening Threshold: `0.24`
In clinical preventive screening, the cost of a **False Negative** (missing a prediabetic individual who subsequently develops diabetic retinopathy or nephropathy) far outweighs the cost of a **False Positive** (advising a healthy individual to obtain a confirmatory blood test and improve their diet).

Operating at the standard default threshold of `0.50` produces severe under-diagnosis. We optimized the decision boundary to **`0.24`**, yielding:
* **High Sensitivity ($\ge 80\%$)**: Successfully captures 4 out of 5 at-risk patients during early asymptomatic windows.
* **Appropriate Specificity**: Balances screening alerts without overwhelming clinical referral pathways.

---

## 5. Model Explainability & Feature Attribution

### Global Explainability: SHAP
Global feature importance was computed across the population cohort using TreeSHAP (Mean Absolute SHAP values):

| Rank | Feature | Mean \|SHAP\| | Primary Clinical Driver |
| :---: | :--- | :---: | :--- |
| 1 | `GenHlth` | **0.6175** | Broadest systemic biomarker of functional reserve |
| 2 | `HighBP` | **0.4898** | Hypertensive vascular strain & insulin resistance |
| 3 | `Age` | **0.3891** | Progressive biological age-related metabolic decline |
| 4 | `BMI` | **0.3824** | Adiposity-driven peripheral insulin desensitization |
| 5 | `HighChol` | **0.3219** | Dyslipidemia & lipid accumulation |
| 6 | `Sex` | **0.1310** | Endocrine differences |
| 7 | `Income` | **0.1305** | Socioeconomic determinants of metabolic health |
| 8 | `CholCheck`| **0.1063** | Engagement with routine laboratory surveillance |

### Local Counterfactual Explainability (Finite-Difference)
For every individual report generated, HealthLens computes real-time model-derived feature attributions against a healthy neutral baseline profile:
$$\text{Baseline: } \{\text{HighBP}=0, \text{HighChol}=0, \text{BMI}=25.0, \text{Smoker}=0, \text{PhysActivity}=1, \dots\}$$

The marginal risk impact $\Delta \text{Risk}_i$ for each user feature $x_i$ is computed as:
$$\Delta \text{Risk}_i = \hat{P}(x_1, \dots, x_i, \dots, x_{21}) - \hat{P}(x_1, \dots, x_i^{\text{baseline}}, \dots, x_{21})$$

This delivers individual patient transparency:
* E.g., *"Your elevated BMI (32.4) accounts for **+8.4%** of your risk, while your regular physical activity reduces your risk by **-3.2%**."*
