
import joblib
import json
import numpy as np
import pandas as pd
from sklearn.utils import resample
from xgboost import XGBClassifier

# Load all components
model = joblib.load('cliniqai_model/model.pkl')
scaler = joblib.load('cliniqai_model/scaler.pkl')
explainer = joblib.load('cliniqai_model/shap_explainer.pkl')

with open('cliniqai_model/config.json') as f:
    config = json.load(f)

OPTIMAL_THRESHOLD = config['optimal_threshold']
scale_cols = config['scale_cols']
feature_cols = config['feature_cols']

def predict_patient(gender, age, hypertension, heart_disease,
                    smoking_history, bmi, hba1c, blood_glucose):

    gender_enc = config['gender_map'][gender]
    smoking_enc = config['smoking_map'].get(smoking_history, -1)

    original_values = {
        "Gender": gender,
        "Age": age,
        "Hypertension": "Yes" if hypertension else "No",
        "Heart Disease": "Yes" if heart_disease else "No",
        "Smoking History": smoking_history,
        "BMI": round(bmi, 2),
        "HbA1c Level": hba1c,
        "Blood Glucose": blood_glucose
    }

    patient_data = pd.DataFrame([{
        "gender_encoded": gender_enc,
        "age": age,
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "smoking_history_encoded": smoking_enc,
        "bmi": bmi,
        "HbA1c_level": hba1c,
        "blood_glucose_level": blood_glucose
    }])

    patient_scaled = patient_data.copy()
    patient_scaled[scale_cols] = scaler.transform(patient_data[scale_cols])

    prob = model.predict_proba(patient_scaled)[0][1]
    prediction = "High Risk" if prob >= OPTIMAL_THRESHOLD else "Low Risk"
    risk_level = (
        "Critical" if prob >= 0.7 else
        "High" if prob >= 0.5 else
        "Moderate" if prob >= 0.3 else
        "Low"
    )

    shap_vals = explainer.shap_values(patient_scaled)
    feature_names_display = config["feature_names_display"]

    contributions = []
    for i, fname in enumerate(feature_names_display):
        contributions.append({
            "feature": fname,
            "original_value": original_values[fname],
            "shap_value": round(float(shap_vals[0][i]), 4),
            "impact": "increases risk" if shap_vals[0][i] > 0 else "decreases risk",
            "magnitude": abs(round(float(shap_vals[0][i]), 4))
        })

    contributions.sort(key=lambda x: x["magnitude"], reverse=True)

    clinical_context = {
        "HbA1c Level": {
            "value": hba1c, "unit": "%",
            "normal": "< 5.7", "prediabetic": "5.7-6.4", "diabetic": "≥ 6.5",
            "status": "Diabetic" if hba1c >= 6.5 else "Prediabetic" if hba1c >= 5.7 else "Normal"
        },
        "Blood Glucose": {
            "value": blood_glucose, "unit": "mg/dL",
            "normal": "< 100", "prediabetic": "100-125", "diabetic": "≥ 126",
            "status": "Diabetic" if blood_glucose >= 126 else "Prediabetic" if blood_glucose >= 100 else "Normal"
        },
        "BMI": {
            "value": bmi, "unit": "kg/m²",
            "normal": "18.5-24.9", "overweight": "25-29.9", "obese": "≥ 30",
            "status": "Obese" if bmi >= 30 else "Overweight" if bmi >= 25 else "Normal"
        }
    }

    return {
        "prediction": prediction,
        "risk_level": risk_level,
        "risk_probability": round(float(prob) * 100, 1),
        "threshold_used": OPTIMAL_THRESHOLD,
        "contributions": contributions,
        "clinical_context": clinical_context,
        "top_factor": contributions[0]["feature"],
        "top_factor_value": contributions[0]["original_value"]
    }


def whatif_simulator(base_patient: dict, changes: dict):
    modified = base_patient.copy()
    modified.update(changes)
    original_result = predict_patient(**base_patient)
    modified_result = predict_patient(**modified)
    risk_change = modified_result["risk_probability"] - original_result["risk_probability"]
    return {
        "original": {
            "values": base_patient,
            "risk": original_result["risk_probability"],
            "level": original_result["risk_level"]
        },
        "modified": {
            "values": modified,
            "risk": modified_result["risk_probability"],
            "level": modified_result["risk_level"]
        },
        "risk_change": round(risk_change, 1),
        "direction": "increased" if risk_change > 0 else "decreased",
        "changed_features": list(changes.keys()),
        "contributions": modified_result["contributions"]
    }
