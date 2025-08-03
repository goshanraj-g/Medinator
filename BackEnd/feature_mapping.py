"""
Feature mapping system to convert user inputs to model-expected features.
This bridges the gap between simple user assessment answers and complex health survey data.
"""

import pandas as pd
import numpy as np

def create_feature_vector_from_user_input(user_data):
    """
    Convert user assessment answers to a feature vector matching the trained models.
    
    Args:
        user_data (dict): User responses from the assessment
        
    Returns:
        pandas.DataFrame: Feature vector ready for model prediction
    """
    
    # Initialize feature vector with default values (mostly missing/not applicable = 6)
    features = {}
    
    # Age mapping: question1 -> DHHGAGE 
    age_mapping = {"18-29": 2, "30-39": 3, "40-49": 4, "50-59": 5, "60+": 6}
    features['DHHGAGE'] = age_mapping.get(user_data.get('question1', ''), 4)  # Default to 40-49
    
    # Gender mapping: question2 -> DHH_SEX
    gender_mapping = {"Male": 1, "Female": 2}
    features['DHH_SEX'] = gender_mapping.get(user_data.get('question2', ''), 1)
    
    # BMI mapping: question3 -> calculated from height/weight or BMI category
    bmi_mapping = {"Underweight": 1, "Normal": 2, "Overweight": 3, "Obese": 4}
    bmi_value = bmi_mapping.get(user_data.get('question3', ''), 2)
    # We'll store this as a general health indicator
    features['DOCCC'] = 1  # Has chronic condition screening
    
    # Smoking: question4 -> SMK_005 (smoking status)
    smoking_mapping = {
        "Never smoked": 3,          # Never smoker
        "Former smoker": 2,         # Former smoker  
        "Occasional smoker": 1,     # Current occasional
        "Regular smoker": 1,        # Current regular
        "Heavy smoker": 1           # Current heavy
    }
    features['SMK_005'] = smoking_mapping.get(user_data.get('question4', ''), 3)
    features['SMK_010'] = 2 if user_data.get('question4', '') == "Never smoked" else 1
    features['SMK_015'] = 6  # Age started smoking (not applicable for never smokers)
    features['SMK_020'] = 2 if user_data.get('question4', '') in ["Never smoked", "Former smoker"] else 1
    features['SMK_025'] = 2 if user_data.get('question4', '') == "Never smoked" else 1
    features['SMK_030'] = 6  # Not applicable
    features['SMKG035'] = 5 if user_data.get('question4', '') == "Heavy smoker" else 2
    
    # Alcohol: question5 -> ALC_005, ALC_010, etc.
    alcohol_mapping = {
        "Never": 2,                           # No
        "Rarely (1-2 times/month)": 1,       # Yes, infrequently  
        "Occasionally (1-2 times/week)": 1,   # Yes, occasionally
        "Regularly (3-4 times/week)": 1,      # Yes, regularly
        "Daily": 1                            # Yes, daily
    }
    features['ALC_005'] = alcohol_mapping.get(user_data.get('question5', ''), 2)
    features['ALC_010'] = 1 if user_data.get('question5', '') != "Never" else 2
    
    alcohol_freq_mapping = {
        "Never": 5,
        "Rarely (1-2 times/month)": 5,
        "Occasionally (1-2 times/week)": 4,
        "Regularly (3-4 times/week)": 3, 
        "Daily": 1
    }
    features['ALC_015'] = alcohol_freq_mapping.get(user_data.get('question5', ''), 5)
    features['ALC_020'] = alcohol_freq_mapping.get(user_data.get('question5', ''), 5)
    features['ALCDVTTM'] = 3 if user_data.get('question5', '') == "Never" else 1
    
    # Physical Activity: question6 -> PAA_005, PAA_030, etc.
    activity_mapping = {
        "Sedentary (no exercise)": 2,        # No
        "Light (1-2 days/week)": 1,          # Yes, light
        "Moderate (3-4 days/week)": 1,       # Yes, moderate  
        "Active (5-6 days/week)": 1,         # Yes, active
        "Very active (daily exercise)": 1    # Yes, very active
    }
    features['PAA_005'] = activity_mapping.get(user_data.get('question6', ''), 2)
    features['PAA_030'] = activity_mapping.get(user_data.get('question6', ''), 2)
    
    # Family History Heart Disease: question7 -> multiple fields
    heart_family_mapping = {
        "No family history": 2,
        "One parent": 1,
        "Both parents": 1,
        "Siblings": 1,
        "Multiple family members": 1
    }
    features['CCC_070'] = heart_family_mapping.get(user_data.get('question7', ''), 2)
    features['CCCDGCAR'] = heart_family_mapping.get(user_data.get('question7', ''), 2)
    
    # Family History Diabetes: question8 -> similar mapping
    diabetes_family_mapping = {
        "No family history": 2,
        "One parent": 1, 
        "Both parents": 1,
        "Siblings": 1,
        "Multiple family members": 1
    }
    features['CCC_080'] = diabetes_family_mapping.get(user_data.get('question8', ''), 2)
    
    # Blood Pressure: question9 -> related to hypertension indicators
    bp_mapping = {
        "No": 2,                            # No hypertension
        "Borderline": 9,                    # Don't know/borderline
        "Yes, controlled with medication": 1, # Yes, controlled
        "Yes, uncontrolled": 1,             # Yes, uncontrolled  
        "Don't know": 9                     # Don't know
    }
    # This affects respiratory and general health indicators
    features['CCCDGRSP'] = bp_mapping.get(user_data.get('question9', ''), 2)
    features['CCCDGSKL'] = bp_mapping.get(user_data.get('question9', ''), 2)
    
    # Overall Health: question10 -> general health indicators
    health_mapping = {
        "Very healthy": 2,      # Good health
        "Mostly healthy": 2,    # Good health
        "Mixed": 1,             # Some issues
        "Somewhat unhealthy": 1, # Health issues
        "Very unhealthy": 1     # Significant health issues
    }
    overall_health = health_mapping.get(user_data.get('question10', ''), 2)
    
    # Age-related features
    features['PAA_045'] = min(45, user_data.get('age', 40))  # Capped age value
    
    # Set default values for remaining features that are commonly not applicable
    default_features = {
        'SMK_055': 96, 'SMK_060': 6, 'SMK_080': 6, 'SMKG090': 6, 'SMK_095': 6,
        'SMK_100': 6, 'SMKG110': 6, 'SMKDVSTY': 6, 'SMKDGYCS': 6, 'SMKDGSTP': 6,
        'ALW_005': 6, 'ALWDVLTR': 6, 'ALWDVSTR': 6,
        'PAA_010A': 6, 'PAA_010B': 6, 'PAA_010C': 6, 'PAA_010D': 6, 'PAA_010E': 6,
        'PAA_010F': 6, 'PAA_010G': 6, 'PAA_035': 6, 'PAA_040A': 6, 'PAA_040B': 6,
        'PAA_040C': 6, 'PAA_040D': 6, 'PAA_040E': 6, 'PAA_040F': 6, 'PAA_040G': 6,
        'PAA_060': 6, 'PAA_065': 6, 'PAA_070A': 6, 'PAA_070B': 6, 'PAA_070C': 6,
        'PAA_070D': 6, 'PAA_070E': 6, 'PAA_070F': 6, 'PAA_070G': 6, 'PAA_095': 6,
        'FLU_005': 2, 'FLU_010': 6, 'FLU_015': 96, 'FLU_020': 6,
        'FLU_025A': 2, 'FLU_025B': 2, 'FLU_025C': 2, 'FLU_025D': 2, 'FLU_025E': 2,
        'FLU_025F': 2, 'FLU_025G': 2, 'FLU_025H': 2, 'FLU_025I': 2, 'FLU_025J': 2,
        'FLU_025K': 2
    }
    
    # Add default features
    features.update(default_features)
    
    # Remove chronic condition columns (they are targets, not features)
    chronic_conditions = ['CCC_035', 'CCC_065', 'CCC_075', 'CCC_095', 'CCC_185', 'CCC_195', 'CCC_200']
    for cc in chronic_conditions:
        if cc in features:
            del features[cc]
    
    # Create DataFrame with single row
    feature_df = pd.DataFrame([features])
    
    # Ensure all missing values are handled
    feature_df = feature_df.fillna(6)  # 6 typically means "not applicable" in the survey
    
    return feature_df

def validate_feature_vector(feature_df, expected_features):
    """
    Validate and align feature vector with model expectations.
    
    Args:
        feature_df (pandas.DataFrame): Generated feature vector
        expected_features (list): List of features expected by the model
        
    Returns:
        pandas.DataFrame: Aligned feature vector
    """
    
    # Add missing features with default value 6 (not applicable)
    for feature in expected_features:
        if feature not in feature_df.columns:
            feature_df[feature] = 6
    
    # Remove extra features not expected by model
    feature_df = feature_df[expected_features]
    
    # Replace any remaining NaN values
    feature_df = feature_df.fillna(6)
    
    return feature_df

def get_user_friendly_prediction_summary(predictions_dict):
    """
    Convert technical prediction results into user-friendly summary.
    
    Args:
        predictions_dict (dict): Raw prediction results
        
    Returns:
        dict: User-friendly summary
    """
    
    condition_names = {
        'CCC_035': 'Hypertension (High Blood Pressure)',
        'CCC_065': 'Diabetes',
        'CCC_075': 'Heart Disease', 
        'CCC_095': 'Stroke',
        'CCC_185': 'Cancer',
        'CCC_195': 'COPD (Chronic Obstructive Pulmonary Disease)',
        'CCC_200': 'Arthritis'
    }
    
    risk_categories = []
    highest_risk = {"condition": None, "probability": 0, "name": ""}
    
    for condition_code, result in predictions_dict.items():
        if result.get('error'):
            continue
            
        condition_name = condition_names.get(condition_code, condition_code)
        probability = result.get('probability', 0)
        risk_level = result.get('risk_level', 'Unknown')
        
        risk_categories.append({
            'condition_code': condition_code,
            'condition_name': condition_name,
            'probability': probability,
            'risk_level': risk_level,
            'prediction': result.get('prediction', 0)
        })
        
        if probability > highest_risk["probability"]:
            highest_risk = {
                "condition": condition_code,
                "probability": probability,
                "name": condition_name,
                "risk_level": risk_level
            }
    
    # Sort by probability (highest risk first)
    risk_categories.sort(key=lambda x: x['probability'], reverse=True)
    
    # Generate overall risk assessment
    high_risk_conditions = [r for r in risk_categories if r['risk_level'] in ['High', 'Very High']]
    moderate_risk_conditions = [r for r in risk_categories if r['risk_level'] == 'Moderate']
    
    overall_risk = "Low"
    if len(high_risk_conditions) >= 2:
        overall_risk = "High"
    elif len(high_risk_conditions) == 1 or len(moderate_risk_conditions) >= 3:
        overall_risk = "Moderate"
    
    return {
        'overall_risk_level': overall_risk,
        'highest_risk_condition': highest_risk,
        'risk_categories': risk_categories,
        'total_conditions_analyzed': len(risk_categories),
        'high_risk_count': len(high_risk_conditions),
        'moderate_risk_count': len(moderate_risk_conditions)
    }
