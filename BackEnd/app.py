from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sys
import os
import google.generativeai as genai
import json

# Add the parent directory to the path so we can import from ML_Model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import ML utilities
from ml_utils import get_available_models, predict_condition_risk, get_all_condition_predictions

# Check for available ML models
try:
    available_models = get_available_models()
    ML_MODEL_AVAILABLE = len(available_models) > 0
    
    if ML_MODEL_AVAILABLE:
        print(f"Found {len(available_models)} trained ML models:")
        for condition, model_path in available_models.items():
            model_name = os.path.basename(model_path)
            print(f"  - {condition}: {model_name}")
        print("ML models are ready for predictions!")
    else:
        print("No trained ML models found. Training new models...")
        # Try to import and train models if none exist
        from ML_Model.Model import ChronicConditionPredictor
        predictor = ChronicConditionPredictor(enable_plotting=False)
        
        df = predictor.load_and_preprocess_data()
        if df is not None:
            available_cccs = [col for col in predictor.ccc_columns if col in df.columns]
            if available_cccs:
                target_condition = available_cccs[0]  # Usually CCC_035
                print(f"Training model for: {target_condition}")
                
                X, y = predictor.prepare_features_and_target(df, target_condition)
                predictor.train_model(X, y)
                model_path = predictor.save_model()
                print(f"Model training completed and saved for {target_condition}")
                
                # Re-check available models
                available_models = get_available_models()
                ML_MODEL_AVAILABLE = len(available_models) > 0
        
        if not ML_MODEL_AVAILABLE:
            print("Could not train or find any ML models")
        
except Exception as e:
    print(f"Warning: Could not load ML model: {e}")
    predictor = None
    ML_MODEL_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Store detective sessions
detective_sessions = {}

# Configure Gemini AI
try:
    api_key = os.getenv('GOOGLE_AI_API_KEY') or 'AIzaSyCkNVGS5ow-ClY_oEvyy7mGqjWZuq7dyjM'
    genai.configure(api_key=api_key)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    GEMINI_AVAILABLE = True
    print("✅ Gemini AI configured successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not configure Gemini AI: {e}")
    gemini_model = None
    GEMINI_AVAILABLE = False

@app.route('/')
def home():
    return 'Welcome to the Medinator API!'

@app.route('/initial', methods=['POST'])
def analyze_data():
    data = request.get_json()
    # Placeholder logic
    result = {"message": "Data received", "input": data}
    return jsonify(result)

@app.route('/diagnose', methods=['GET'])
def diagnose_get():
    return jsonify({"message": "Diagnose endpoint is working. Use POST method with answers data.", "status": "ready"})

def analyze_with_gemini(diagnosis_data, user_assessment):
    """Use Gemini AI to provide intelligent analysis of diagnosis results"""
    if not GEMINI_AVAILABLE:
        return {"error": "Gemini AI not available", "analysis": "AI analysis unavailable"}
    
    try:
        # Format the data for Gemini analysis
        prompt = f"""You are a health analysis expert. Analyze the following health assessment and ML diagnosis results to provide personalized insights.
        Note that this information is from machine learning models and should not be full medical advice.
        Do acknowledge that this information is from the Canadian Community Health Survey (CCHS)
        Take this information, and keep it in mind. We provided a quick diagnostic, and this is what we found:
        Keep in mind that you are going to be like akinator and ask questions to narrow down the possibilities, and find out what the user is going to be of risk of, and a percentage 

USER PROFILE:
- Age: {user_assessment.get('age', 'Not specified')}
- Gender: {user_assessment.get('gender', 'Not specified')}
- Height: {user_assessment.get('height', 'Not specified')}
- Weight: {user_assessment.get('weight', 'Not specified')}
- Health Concerns: {user_assessment.get('concerns', 'None specified')}
- Ethnicity: {user_assessment.get('ethnicity', 'Not specified')}

LIFESTYLE FACTORS:
- Smoking Status: {user_assessment.get('question4', 'Not specified')}
- Alcohol Consumption: {user_assessment.get('question5', 'Not specified')}
- Exercise Level: {user_assessment.get('question6', 'Not specified')}
- Sleep Pattern: {user_assessment.get('question3', 'Not specified')}
- Overall Health Self-Rating: {user_assessment.get('question10', 'Not specified')}

FAMILY HISTORY:
- Heart Disease: {user_assessment.get('question7', 'Not specified')}
- Diabetes: {user_assessment.get('question8', 'Not specified')}

CURRENT HEALTH STATUS:
- Blood Pressure: {user_assessment.get('question9', 'Not specified')}

ML MODEL PREDICTIONS:
{json.dumps(diagnosis_data, indent=2)}

You are going to take in this information, and return a quick summary about the user. You will be called later to ask questions to narrow down the possibilities, and find out what the user is going to be of risk of, and a percentage.
You wont stop until they trigger stop, and just keep asking questions until you are certain, and then move onto the next condition.
"""

        response = gemini_model.generate_content(prompt)
        
        return {
            "analysis": response.text,
            "status": "success",
            "model": "gemini-1.5-flash",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return {
            "error": f"Analysis failed: {str(e)}",
            "analysis": "Unable to provide AI analysis at this time",
            "status": "error"
        }

@app.route('/diagnose', methods=['POST'])
def diagnose():
    try:
        # Get user inputs from the request
        data = request.get_json()
        user_answers = data.get('answers', {})
        
        print(f"Received answers: {user_answers}")
        
        # Map frontend answers to ML model format
        # You'll need to adjust this mapping based on your ML model's expected input format
        ml_inputs = []
        
        # Map context form answers (first 6)
        ml_inputs.append(float(user_answers.get('age', 0)) if user_answers.get('age') else 0)
        ml_inputs.append(1 if user_answers.get('gender') == 'Male' else 0)  # Binary encoding
        
        # Parse height (e.g., "5'10" -> 70 inches)
        height_str = user_answers.get('height', '0')
        try:
            if "'" in height_str:
                feet, inches = height_str.split("'")
                total_inches = int(feet) * 12 + int(inches.replace('"', ''))
            else:
                total_inches = float(height_str) if height_str else 0
            ml_inputs.append(total_inches)
        except:
            ml_inputs.append(0)
            
        ml_inputs.append(float(user_answers.get('weight', 0)) if user_answers.get('weight') else 0)
        
        # Map concerns to a simple binary (has concerns = 1, no concerns = 0)
        concerns_value = 1 if user_answers.get('concerns', '').strip() else 0
        ml_inputs.append(concerns_value)
        
        # Map ethnicity to numerical value (you may need to adjust this)
        ethnicity_map = {
            "White/Caucasian": 0, "Black/African American": 1, "Hispanic/Latino": 2,
            "Asian": 3, "Native American": 4, "Pacific Islander": 5,
            "Middle Eastern": 6, "Mixed Race": 7, "Other": 8, "Prefer not to say": 9
        }
        ml_inputs.append(ethnicity_map.get(user_answers.get('ethnicity'), 9))
        
        # Map diagnostic question answers (next 10)
        question_mappings = {
            "question1": {"Very Low": 0, "Low": 1, "Moderate": 2, "High": 3, "Very High": 4},
            "question2": {"Excellent": 0, "Good": 1, "Fair": 2, "Poor": 3, "Very Poor": 4},
            "question3": {"Less than 5 hours": 0, "5-6 hours": 1, "6-7 hours": 2, "7-8 hours": 3, "More than 8 hours": 4},
            "question4": {"Never smoked": 0, "Former smoker": 1, "Occasional smoker": 2, "Regular smoker": 3, "Heavy smoker": 4},
            "question5": {"Never": 0, "Rarely (1-2 times/month)": 1, "Occasionally (1-2 times/week)": 2, "Regularly (3-4 times/week)": 3, "Daily": 4},
            "question6": {"Sedentary (no exercise)": 0, "Light (1-2 days/week)": 1, "Moderate (3-4 days/week)": 2, "Active (5-6 days/week)": 3, "Very active (daily exercise)": 4},
            "question7": {"No family history": 0, "One parent": 1, "Both parents": 2, "Siblings": 3, "Multiple family members": 4},
            "question8": {"No family history": 0, "One parent": 1, "Both parents": 2, "Siblings": 3, "Multiple family members": 4},
            "question9": {"No": 0, "Borderline": 1, "Yes, controlled with medication": 2, "Yes, uncontrolled": 3, "Don't know": 4},
            "question10": {"Very healthy": 0, "Mostly healthy": 1, "Mixed": 2, "Somewhat unhealthy": 3, "Very unhealthy": 4}
        }
        
        for i in range(1, 11):
            question_key = f"question{i}"
            answer = user_answers.get(question_key, "")
            mapping = question_mappings.get(question_key, {})
            ml_inputs.append(mapping.get(answer, 0))
        
        print(f"Processed ML inputs: {ml_inputs}")
        
        # Validate input length
        if len(ml_inputs) != 16:
            return jsonify({"error": f"Insufficient inputs processed. Expected 16, got {len(ml_inputs)}. Inputs: {ml_inputs}"}), 400

        # Use the actual ML models if available
        if ML_MODEL_AVAILABLE:
            try:
                # Create simplified user input dictionary for ML prediction
                user_assessment = {
                    'age': int(user_answers.get('age', 40)),
                    'gender': user_answers.get('gender', 'Male'),
                    'height': user_answers.get('height', ''),
                    'weight': float(user_answers.get('weight', 0)) if user_answers.get('weight') else 0,
                    'concerns': user_answers.get('concerns', ''),
                    'ethnicity': user_answers.get('ethnicity', ''),
                    'question1': user_answers.get('question1', ''),  # Age range
                    'question2': user_answers.get('question2', ''),  # Gender
                    'question3': user_answers.get('question3', ''),  # BMI category
                    'question4': user_answers.get('question4', ''),  # Smoking
                    'question5': user_answers.get('question5', ''),  # Alcohol
                    'question6': user_answers.get('question6', ''),  # Exercise
                    'question7': user_answers.get('question7', ''),  # Family history heart
                    'question8': user_answers.get('question8', ''),  # Family history diabetes
                    'question9': user_answers.get('question9', ''),  # Blood pressure
                    'question10': user_answers.get('question10', '') # Overall health
                }
                
                print(f"Making predictions for user assessment: {user_assessment}")
                
                # Get predictions for all available chronic conditions
                all_predictions = get_all_condition_predictions(user_assessment)
                
                # Get Gemini AI analysis of the diagnosis
                gemini_analysis = analyze_with_gemini(all_predictions, user_assessment)
                
                # Format the response with actual ML predictions and AI analysis
                response = {
                    "message": "Multi-condition diagnostic analysis complete",
                    "predictions": all_predictions,
                    "ai_analysis": gemini_analysis,
                    "user_assessment": user_assessment,
                    "total_conditions_analyzed": len(all_predictions),
                    "analysis_timestamp": pd.Timestamp.now().isoformat(),
                    "model_version": "joblib_production_v2",
                    "ai_enabled": GEMINI_AVAILABLE
                }
                
                return jsonify(response)
                
            except Exception as model_error:
                print(f"ML Model prediction error: {model_error}")
                # Fall back to mock response if model fails
                return jsonify({
                    "error": f"Model prediction failed: {str(model_error)}",
                    "fallback": True,
                    "user_assessment": user_answers
                }), 500
        
        else:
            # Fallback mock response when ML model is not available
            mock_predictions = {
                "cardiovascular_risk": "moderate",
                "diabetes_risk": "low", 
                "mental_health_risk": "moderate"
            }
            
            # Create mock user assessment for Gemini
            mock_user_assessment = {
                'age': user_answers.get('age', 40),
                'gender': user_answers.get('gender', 'Male'),
                'height': user_answers.get('height', ''),
                'weight': user_answers.get('weight', 0),
                'concerns': user_answers.get('concerns', ''),
                'ethnicity': user_answers.get('ethnicity', ''),
                'question1': user_answers.get('question1', ''),
                'question2': user_answers.get('question2', ''),
                'question3': user_answers.get('question3', ''),
                'question4': user_answers.get('question4', ''),
                'question5': user_answers.get('question5', ''),
                'question6': user_answers.get('question6', ''),
                'question7': user_answers.get('question7', ''),
                'question8': user_answers.get('question8', ''),
                'question9': user_answers.get('question9', ''),
                'question10': user_answers.get('question10', '')
            }
            
            # Get Gemini analysis even with mock data
            gemini_analysis = analyze_with_gemini(mock_predictions, mock_user_assessment)
            
            mock_response = {
                "message": "Diagnostic analysis complete (using mock data - ML model not available)",
                "risk_factors": mock_predictions,
                "ai_analysis": gemini_analysis,
                "recommendations": [
                    "Consider increasing physical activity",
                    "Monitor stress levels",
                    "Regular health checkups recommended"
                ],
                "processed_inputs": ml_inputs,
                "model_version": "mock",
                "ai_enabled": GEMINI_AVAILABLE
            }
            
            return jsonify(mock_response)

    except Exception as e:
        print(f"Error in diagnosis: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)