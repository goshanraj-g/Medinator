import requests
import json

# Test the new multi-condition prediction API
url = "http://127.0.0.1:5000/diagnose"

# Sample test data
test_data = {
    "age": 45,
    "gender": "Male",
    "height": "5'10\"",
    "weight": 180,
    "concerns": "High blood pressure runs in family",
    "ethnicity": "White/Caucasian",
    "question1": "40-49",
    "question2": "Male", 
    "question3": "Overweight",
    "question4": "Former smoker",
    "question5": "Occasionally (1-2 times/week)",
    "question6": "Moderate (3-4 days/week)",
    "question7": "One parent",
    "question8": "No family history",
    "question9": "Borderline",
    "question10": "Mostly healthy"
}

try:
    print("Testing new multi-condition ML prediction API...")
    print(f"Sending request to: {url}")
    print(f"Test data: {json.dumps(test_data, indent=2)}")
    print("-" * 60)
    
    response = requests.post(url, json=test_data, timeout=30)
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print("-" * 60)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS! Multi-condition prediction results:")
        print(json.dumps(result, indent=2))
        
        if "predictions" in result:
            print("\n📊 Summary of Condition Predictions:")
            predictions = result["predictions"]
            for condition, pred_data in predictions.items():
                if not pred_data.get("error"):
                    condition_name = pred_data.get("display_name", condition)
                    probability = pred_data.get("probability", 0)
                    risk_level = pred_data.get("risk_level", "Unknown")
                    prediction = pred_data.get("prediction", 0)
                    
                    status = "🔴 Positive" if prediction == 1 else "🟢 Negative"
                    print(f"   {condition_name}: {status} (Risk: {risk_level}, Probability: {probability:.3f})")
                else:
                    print(f"   {condition}: ❌ Error - {pred_data.get('error')}")
    else:
        print(f"❌ ERROR: Request failed with status {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ ERROR: Could not connect to Flask server. Make sure it's running on http://127.0.0.1:5000")
except requests.exceptions.Timeout:
    print("❌ ERROR: Request timed out after 30 seconds")
except Exception as e:
    print(f"❌ ERROR: {str(e)}")
