from app.services.prediction_service import (
    predict_diabetes_risk
)


test_user = {
    "HighBP": 1,
    "HighChol": 1,
    "CholCheck": 1,
    "BMI": 26.0,
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
    "Sex": 0,
    "Age": 8,
    "Education": 6,
    "Income": 5
}


result = predict_diabetes_risk(test_user)

print("\nPrediction Result:")
print(result)
