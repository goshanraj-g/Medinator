#!/usr/bin/env python3
"""
Script to train and save ML models for all chronic conditions.
This creates joblib files that can be quickly loaded in the web application.
"""

import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import from ML_Model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ML_Model.Model import ChronicConditionPredictor

def train_and_save_all_models():
    """Train and save models for all available chronic conditions."""
    
    print("=== Chronic Conditions ML Model Training & Saving ===")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Initialize predictor with plotting disabled for batch processing
    predictor = ChronicConditionPredictor(enable_plotting=False)
    
    # Load and preprocess data
    print("Loading and preprocessing data...")
    df = predictor.load_and_preprocess_data()
    
    if df is None:
        print("ERROR: Could not load data. Please check the file path.")
        return False
    
    # Get available chronic conditions
    available_cccs = [col for col in predictor.ccc_columns if col in df.columns]
    print(f"\nFound {len(available_cccs)} chronic conditions to train: {available_cccs}")
    
    results = []
    saved_models = []
    
    for i, ccc in enumerate(available_cccs, 1):
        print(f"\n{'='*60}")
        print(f"TRAINING MODEL {i}/{len(available_cccs)}: {ccc}")
        print(f"{'='*60}")
        
        try:
            # Prepare features and target for this condition
            X, y = predictor.prepare_features_and_target(df, ccc)
            
            # Train the model
            X_test, y_test = predictor.train_model(X, y)
            
            if X_test is not None:
                # Save the trained model
                model_path = predictor.save_model()
                saved_models.append(model_path)
                
                # Get model performance
                y_proba = predictor.model.predict_proba(X_test)[:, 1]
                y_pred = (y_proba >= predictor.optimal_threshold).astype(int)
                
                from sklearn.metrics import f1_score, accuracy_score, roc_auc_score
                f1 = f1_score(y_test, y_pred, zero_division=0)
                accuracy = accuracy_score(y_test, y_pred)
                auc = roc_auc_score(y_test, y_proba) if len(set(y_test)) > 1 else 0
                
                results.append({
                    'condition': ccc,
                    'f1_score': f1,
                    'accuracy': accuracy,
                    'auc': auc,
                    'threshold': predictor.optimal_threshold,
                    'model_path': model_path,
                    'status': 'SUCCESS'
                })
                
                print(f"✅ SUCCESS: Model saved for {ccc}")
                
            else:
                results.append({
                    'condition': ccc,
                    'f1_score': 0,
                    'accuracy': 0,
                    'auc': 0,
                    'threshold': 0.5,
                    'model_path': None,
                    'status': 'FAILED - Training failed'
                })
                print(f"❌ FAILED: Could not train model for {ccc}")
                
        except Exception as e:
            print(f"❌ ERROR training {ccc}: {str(e)}")
            results.append({
                'condition': ccc,
                'f1_score': 0,
                'accuracy': 0,
                'auc': 0,
                'threshold': 0.5,
                'model_path': None,
                'status': f'ERROR: {str(e)}'
            })
    
    # Print summary
    print(f"\n{'='*80}")
    print("TRAINING SUMMARY")
    print(f"{'='*80}")
    print(f"{'Condition':<12} {'Status':<20} {'F1':<8} {'Accuracy':<10} {'AUC':<8} {'Threshold':<10}")
    print(f"{'-'*80}")
    
    successful_models = 0
    for result in results:
        status_display = result['status'][:18] + ".." if len(result['status']) > 20 else result['status']
        print(f"{result['condition']:<12} {status_display:<20} {result['f1_score']:<8.3f} "
              f"{result['accuracy']:<10.3f} {result['auc']:<8.3f} {result['threshold']:<10.3f}")
        if result['status'] == 'SUCCESS':
            successful_models += 1
    
    print(f"\n📊 Results:")
    print(f"   ✅ Successfully trained: {successful_models}/{len(available_cccs)} models")
    print(f"   💾 Models saved to: ML_Model/saved_models/")
    print(f"   ⏱️  Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if saved_models:
        print(f"\n📁 Saved model files:")
        for model_path in saved_models:
            model_name = os.path.basename(model_path)
            print(f"   - {model_name}")
    
    return successful_models > 0

def load_and_test_model(model_path):
    """Test loading a saved model and making a prediction."""
    
    print(f"\n=== Testing Model Loading ===")
    print(f"Loading model from: {model_path}")
    
    # Load the model using the class method
    predictor = ChronicConditionPredictor.load_from_file(model_path, enable_plotting=False)
    
    if predictor is None:
        print("❌ Failed to load model")
        return False
    
    print("✅ Model loaded successfully!")
    
    # Load some test data
    df = predictor.load_and_preprocess_data()
    if df is not None:
        # Get features for the target condition
        X = df.drop(columns=predictor.ccc_columns)
        
        # Test prediction on first row
        test_sample = X.iloc[:1]
        predictions, probabilities = predictor.predict_new_sample(test_sample)
        
        print(f"🧪 Test prediction:")
        print(f"   Condition: {predictor.target_column}")
        print(f"   Probability: {probabilities[0]:.3f}")
        print(f"   Prediction: {'Has condition' if predictions[0] == 1 else 'No condition'}")
        
        return True
    
    return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train and save ML models for chronic conditions')
    parser.add_argument('--test-model', type=str, help='Path to a saved model to test loading')
    parser.add_argument('--condition', type=str, help='Train only a specific condition (e.g., CCC_035)')
    
    args = parser.parse_args()
    
    if args.test_model:
        # Test loading a specific model
        load_and_test_model(args.test_model)
    else:
        # Train and save all models
        success = train_and_save_all_models()
        
        if success:
            print(f"\n🎉 Training completed successfully!")
            print(f"💡 To use these models in your web app:")
            print(f"   predictor = ChronicConditionPredictor.load_from_file('path/to/model.joblib')")
            print(f"   predictions, probabilities = predictor.predict_new_sample(user_data)")
        else:
            print(f"\n⚠️  No models were successfully trained.")
