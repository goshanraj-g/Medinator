from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sys
import os

# Add the parent directory to the path so we can import from ML_Model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import the ML model, but continue if it fails
try:
    from ML_Model.Model import ChronicConditionPredictor
    predictor = ChronicConditionPredictor()
    ML_MODEL_AVAILABLE = True
    print("ML Model loaded successfully")
except Exception as e:
    print(f"Warning: Could not load ML model: {e}")
    predictor = None
    ML_MODEL_AVAILABLE = False

app = Flask(__name__)
CORS(app)

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
        if len(ml_inputs) <= 15:
            return jsonify({"error": f"Insufficient inputs processed. Expected 16, got {len(ml_inputs)}."}), 400

        # For now, return a mock response since the ML model needs to be trained first
        # You'll need to train your model with the actual data first
        mock_response = {
            "message": "Diagnostic analysis complete",
            "risk_factors": {
                "cardiovascular_risk": "moderate",
                "diabetes_risk": "low", 
                "mental_health_risk": "moderate"
            },
            "recommendations": [
                "Consider increasing physical activity",
                "Monitor stress levels",
                "Regular health checkups recommended"
            ],
            "processed_inputs": ml_inputs
        }
        
        return jsonify(mock_response)
        
        # Uncomment this when your ML model is trained and ready:
        # input_df = pd.DataFrame([ml_inputs[:16]], columns=predictor.feature_names[:16])
        # predictions, probabilities = predictor.predict_new_sample(input_df)
        # response = {
        #     "predictions": predictions.tolist(),
        #     "probabilities": probabilities.tolist()
        # }
        # return jsonify(response)

    except Exception as e:
        print(f"Error in diagnosis: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)