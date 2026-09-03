FEATURE_QUESTIONS = {

    "HighBP": {
        "question": "Have you ever been told that you have high blood pressure?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "HighChol": {
        "question": "Have you ever been told that you have high cholesterol?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "CholCheck": {
        "question": "Have you had your cholesterol checked recently?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "BMI": {
        "question": "What is your BMI?",
        "type": "number",
        "min": 10,
        "max": 100
    },

    "Smoker": {
        "question": "Are you a smoker?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "Stroke": {
        "question": "Have you ever had a stroke?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "HeartDiseaseorAttack": {
        "question": "Have you ever had heart disease or a heart attack?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "PhysActivity": {
        "question": "Have you participated in physical activity recently?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "Fruits": {
        "question": "Do you regularly consume fruits?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "Veggies": {
        "question": "Do you regularly consume vegetables?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "HvyAlcoholConsump": {
        "question": "Do you have heavy alcohol consumption?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "AnyHealthcare": {
        "question": "Do you currently have healthcare coverage?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "NoDocbcCost": {
        "question": "Have you been unable to see a doctor because of cost?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "GenHlth": {
        "question": "How would you rate your general health?",
        "type": "select",
        "options": [
            {"label": "Excellent", "value": 1},
            {"label": "Very good", "value": 2},
            {"label": "Good", "value": 3},
            {"label": "Fair", "value": 4},
            {"label": "Poor", "value": 5}
        ]
    },

    "MentHlth": {
        "question": "For how many days during the past 30 days was your mental health not good?",
        "type": "number",
        "min": 0,
        "max": 30
    },

    "PhysHlth": {
        "question": "For how many days during the past 30 days was your physical health not good?",
        "type": "number",
        "min": 0,
        "max": 30
    },

    "DiffWalk": {
        "question": "Do you have serious difficulty walking or climbing stairs?",
        "type": "boolean",
        "options": [
            {"label": "Yes", "value": 1},
            {"label": "No", "value": 0}
        ]
    },

    "Sex": {
        "question": "What is your sex?",
        "type": "select",
        "options": [
            {"label": "Female", "value": 0},
            {"label": "Male", "value": 1}
        ]
    },

    "Age": {
        "question": "What is your age category?",
        "type": "select",
        "options": [
            {"label": "18–24", "value": 1},
            {"label": "25–29", "value": 2},
            {"label": "30–34", "value": 3},
            {"label": "35–39", "value": 4},
            {"label": "40–44", "value": 5},
            {"label": "45–49", "value": 6},
            {"label": "50–54", "value": 7},
            {"label": "55–59", "value": 8},
            {"label": "60–64", "value": 9},
            {"label": "65–69", "value": 10},
            {"label": "70–74", "value": 11},
            {"label": "75–79", "value": 12},
            {"label": "80+", "value": 13}
        ]
    },

    "Education": {
        "question": "What is your highest level of education?",
        "type": "select",
        "options": [
            {"label": "Never attended school", "value": 1},
            {"label": "Elementary school", "value": 2},
            {"label": "Some high school", "value": 3},
            {"label": "High school graduate", "value": 4},
            {"label": "Some college", "value": 5},
            {"label": "College graduate", "value": 6}
        ]
    },

    "Income": {
        "question": "What is your household income category?",
        "type": "select",
        "options": [
            {"label": "Less than $10,000", "value": 1},
            {"label": "$10,000–$14,999", "value": 2},
            {"label": "$15,000–$19,999", "value": 3},
            {"label": "$20,000–$24,999", "value": 4},
            {"label": "$25,000–$34,999", "value": 5},
            {"label": "$35,000–$49,999", "value": 6},
            {"label": "$50,000–$74,999", "value": 7},
            {"label": "$75,000 or more", "value": 8}
        ]
    }
}
