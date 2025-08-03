"""
Utility functions for loading and using ML models in the web application.
"""

import os
import glob
import pandas as pd
from ML_Model.Model import ChronicConditionPredictor
from feature_mapping import create_feature_vector_from_user_input, validate_feature_vector

def get_available_models(models_dir=None):
    """
    Get a list of all available trained models.
    
    Returns:
        dict: Dictionary mapping condition names to model file paths
    """
    if models_dir is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(os.path.dirname(current_dir), "ML_Model", "saved_models")
    
    models = {}
    
    if os.path.exists(models_dir):
        model_files = glob.glob(os.path.join(models_dir, "*.joblib"))
        
        for model_file in model_files:
            filename = os.path.basename(model_file)
            # Extract condition name from filename (e.g., "chronic_condition_model_CCC_035_timestamp.joblib")
            if "chronic_condition_model_" in filename:
                parts = filename.split("_")
                if len(parts) >= 5:  # Changed from 4 to 5 to account for CCC_XXX format
                    condition = f"{parts[3]}_{parts[4]}"  # CCC_035, CCC_065, etc.
                    
                    # If multiple models for same condition, keep the most recent
                    if condition not in models:
                        models[condition] = model_file
                    else:
                        # Compare modification times and keep the newest
                        current_mtime = os.path.getmtime(model_file)
                        existing_mtime = os.path.getmtime(models[condition])
                        if current_mtime > existing_mtime:
                            models[condition] = model_file
    
    return models

def load_model_for_condition(condition, models_dir=None):
    """
    Load a trained model for a specific chronic condition.
    
    Args:
        condition (str): Chronic condition code (e.g., 'CCC_035')
        models_dir (str): Directory containing saved models
    
    Returns:
        ChronicConditionPredictor: Loaded model instance, or None if not found
    """
    available_models = get_available_models(models_dir)
    
    if condition in available_models:
        model_path = available_models[condition]
        predictor = ChronicConditionPredictor.load_from_file(model_path, enable_plotting=False)
        return predictor
    else:
        print(f"No trained model found for condition: {condition}")
        print(f"Available models: {list(available_models.keys())}")
        return None

def get_model_info(condition, models_dir=None):
    """
    Get information about a trained model without loading it.
    
    Args:
        condition (str): Chronic condition code
        models_dir (str): Directory containing saved models
    
    Returns:
        dict: Model information or None if not found
    """
    available_models = get_available_models(models_dir)
    
    if condition in available_models:
        model_path = available_models[condition]
        filename = os.path.basename(model_path)
        file_size = os.path.getsize(model_path)
        modification_time = os.path.getmtime(model_path)
        
        return {
            'condition': condition,
            'model_path': model_path,
            'filename': filename,
            'file_size_mb': round(file_size / (1024 * 1024), 2),
            'last_modified': modification_time
        }
    
    return None

def predict_condition_risk(user_inputs, condition='CCC_035', models_dir=None):
    """
    Make a prediction for a specific chronic condition based on user inputs.
    
    Args:
        user_inputs (dict): User's assessment answers
        condition (str): Chronic condition to predict
        models_dir (str): Directory containing saved models
    
    Returns:
        dict: Prediction results with probability and risk level
    """
    # Load the model for the specified condition
    predictor = load_model_for_condition(condition, models_dir)
    
    if predictor is None:
        return {
            'error': f'No model available for condition {condition}',
            'condition': condition,
            'prediction': None,
            'probability': None,
            'risk_level': None
        }
    
    try:
        # Convert user inputs to proper feature vector
        feature_df = create_feature_vector_from_user_input(user_inputs)
        
        # Validate and align with model expectations
        aligned_features = validate_feature_vector(feature_df, predictor.feature_names)
        
        print(f"Generated feature vector shape: {aligned_features.shape}")
        print(f"Expected features count: {len(predictor.feature_names)}")
        print(f"Feature vector columns: {aligned_features.columns.tolist()[:10]}...")  # Show first 10
        
        # Make prediction
        predictions, probabilities = predictor.predict_new_sample(aligned_features)
        
        if predictions is None or probabilities is None:
            return {
                'error': 'Prediction failed - model returned None',
                'condition': condition,
                'prediction': None,
                'probability': None,
                'risk_level': None
            }
        
        prediction = int(predictions[0])
        probability = float(probabilities[0])
        
        # Determine risk level based on probability
        if probability < 0.2:
            risk_level = 'Low'
        elif probability < 0.5:
            risk_level = 'Moderate'
        elif probability < 0.8:
            risk_level = 'High'
        else:
            risk_level = 'Very High'
        
        return {
            'condition': condition,
            'prediction': prediction,  # 0 = No condition, 1 = Has condition
            'probability': probability,
            'risk_level': risk_level,
            'threshold': predictor.optimal_threshold,
            'model_version': predictor.model_version,
            'training_date': predictor.training_date,
            'error': None
        }
        
    except Exception as e:
        print(f"Prediction error for {condition}: {str(e)}")
        return {
            'error': f'Prediction error: {str(e)}',
            'condition': condition,
            'prediction': None,
            'probability': None,
            'risk_level': None
        }

# Condition name mappings for user-friendly display
CONDITION_NAMES = {
    'CCC_035': 'Hypertension (High Blood Pressure)',
    'CCC_065': 'Diabetes',
    'CCC_075': 'Heart Disease',
    'CCC_095': 'Stroke',
    'CCC_185': 'Cancer',
    'CCC_195': 'COPD (Chronic Obstructive Pulmonary Disease)',
    'CCC_200': 'Arthritis'
}

def get_condition_display_name(condition_code):
    """Get user-friendly name for a condition code."""
    return CONDITION_NAMES.get(condition_code, condition_code)

def get_all_condition_predictions(user_inputs, models_dir=None):
    """
    Get predictions for all available chronic conditions.
    
    Args:
        user_inputs (dict or pandas.DataFrame): User's assessment answers
        models_dir (str): Directory containing saved models
    
    Returns:
        dict: Predictions for all conditions
    """
    available_models = get_available_models(models_dir)
    results = {}
    
    for condition in available_models.keys():
        result = predict_condition_risk(user_inputs, condition, models_dir)
        result['display_name'] = get_condition_display_name(condition)
        results[condition] = result
    
    return results
