import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import os
import joblib
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import (classification_report, confusion_matrix, 
                           roc_auc_score, roc_curve, precision_recall_curve,
                           f1_score, accuracy_score, precision_score, recall_score)
from sklearn.utils.class_weight import compute_class_weight
import warnings
warnings.filterwarnings('ignore')

class ChronicConditionPredictor:
    
    def __init__(self, enable_plotting=True):
        self.model = None
        self.imputer = SimpleImputer(strategy='median')
        self.scaler = StandardScaler()
        self.feature_names = []
        self.target_column = None
        self.optimal_threshold = 0.5
        self.class_weights = None
        self.missing_codes = [96, 99996, 9, 999, 9999]
        self.enable_plotting = enable_plotting
        self.ccc_columns = ['CCC_035', 'CCC_065', 'CCC_075', 'CCC_095', 
                           'CCC_185', 'CCC_195', 'CCC_200']
        self.model_version = "1.0"
        self.training_date = None
    
    def load_and_preprocess_data(self, file_path=None):
        # Default to the correct path relative to the project root
        if file_path is None:
            # Get the project root directory (parent of ML_Model)
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(current_dir)
            file_path = os.path.join(project_root, "data", "filtered_data.csv")
        
        try:
            df = pd.read_csv(file_path)
            print(f"Data loaded from {file_path}")
        except FileNotFoundError:
            print(f"Error: File '{file_path}' not found!")
            return None
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            return None
        
        print(f"Dataset shape: {df.shape}")
        print(f"Chronic condition columns found: {[col for col in self.ccc_columns if col in df.columns]}")
        print(f"First 5 rows preview:")
        print(df.head())
        
        for code in self.missing_codes:
            df = df.replace(code, np.nan)
        
        return df
    
    def prepare_features_and_target(self, df, target_column):
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset")
        
        X = df.drop(columns=self.ccc_columns)
        y = df[target_column].copy()
        y = (y == 1).astype(int)
        
        mask = ~y.isna()
        X = X[mask]
        y = y[mask]
        
        self.feature_names = X.columns.tolist()
        self.target_column = target_column
        
        print(f"Predicting: {target_column}")
        print(f"Features: {len(self.feature_names)} columns")
        print(f"Samples: {len(y)} rows")
        
        return X, y
    
    def analyze_class_balance(self, y):
        unique, counts = np.unique(y, return_counts=True)
        class_dist = dict(zip(unique, counts))
        
        print(f"Class distribution: {class_dist}")
        
        if len(unique) > 1:
            imbalance_ratio = max(counts) / min(counts)
            print(f"Imbalance ratio: {imbalance_ratio:.2f}:1")
            
            if imbalance_ratio > 10:
                print("Severe class imbalance detected! Using custom weights.")
                class_weights = compute_class_weight('balanced', classes=unique, y=y)
                self.class_weights = dict(zip(unique, class_weights))
                max_weight = 10
                for key in self.class_weights:
                    if self.class_weights[key] > max_weight:
                        self.class_weights[key] = max_weight
            else:
                self.class_weights = 'balanced'
                
            print(f"Using class weights: {self.class_weights}")
        else:
            print("Only one class present in target variable!")
            return False
        
        return True
    
    def find_optimal_threshold(self, X_val, y_val):
        y_proba = self.model.predict_proba(X_val)[:, 1]
        thresholds = np.linspace(0.1, 0.9, 50)
        f1_scores = []
        
        for threshold in thresholds:
            y_pred = (y_proba >= threshold).astype(int)
            if len(np.unique(y_pred)) > 1:
                f1 = f1_score(y_val, y_pred)
                f1_scores.append(f1)
            else:
                f1_scores.append(0)
        
        best_idx = np.argmax(f1_scores)
        self.optimal_threshold = thresholds[best_idx]
        
        print(f"Optimal threshold found: {self.optimal_threshold:.3f}")
        print(f"Best F1-score: {f1_scores[best_idx]:.3f}")
        
        return self.optimal_threshold
    
    def train_model(self, X, y, test_size=0.2, random_state=42):
        if not self.analyze_class_balance(y):
            return None
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, 
            stratify=y if len(np.unique(y)) > 1 else None
        )
        
        X_train_imputed = self.imputer.fit_transform(X_train)
        X_test_imputed = self.imputer.transform(X_test)
        
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight=self.class_weights,
            random_state=random_state,
            n_jobs=-1,
            bootstrap=True,
            oob_score=True
        )
        
        print("Training Random Forest model...")
        self.model.fit(X_train_imputed, y_train)
        self.training_date = datetime.now().isoformat()
        
        self.find_optimal_threshold(X_test_imputed, y_test)
        self.evaluate_model(X_test_imputed, y_test)
        self.cross_validate(X, y)
        
        return X_test_imputed, y_test
    
    def evaluate_model(self, X_test, y_test):
        y_proba = self.model.predict_proba(X_test)[:, 1]
        y_pred = (y_proba >= self.optimal_threshold).astype(int)
        y_pred_default = self.model.predict(X_test)
        
        print("\n" + "="*50)
        print("MODEL EVALUATION RESULTS")
        print("="*50)
        
        print(f"\nPerformance with optimal threshold ({self.optimal_threshold:.3f}):")
        print(f"   Accuracy:  {accuracy_score(y_test, y_pred):.3f}")
        print(f"   Precision: {precision_score(y_test, y_pred, zero_division=0):.3f}")
        print(f"   Recall:    {recall_score(y_test, y_pred, zero_division=0):.3f}")
        print(f"   F1-Score:  {f1_score(y_test, y_pred, zero_division=0):.3f}")
        
        print(f"\nPerformance with default threshold (0.5):")
        print(f"   Accuracy:  {accuracy_score(y_test, y_pred_default):.3f}")
        print(f"   Precision: {precision_score(y_test, y_pred_default, zero_division=0):.3f}")
        print(f"   Recall:    {recall_score(y_test, y_pred_default, zero_division=0):.3f}")
        print(f"   F1-Score:  {f1_score(y_test, y_pred_default, zero_division=0):.3f}")
        
        if len(np.unique(y_test)) > 1:
            auc = roc_auc_score(y_test, y_proba)
            print(f"\nROC-AUC Score: {auc:.3f}")
        
        if self.enable_plotting:
            self.plot_feature_importance()
            self.plot_confusion_matrix(y_test, y_pred)
            
            if len(np.unique(y_test)) > 1:
                self.plot_roc_curve(y_test, y_proba)
    
    def cross_validate(self, X, y, cv_folds=5):
        X_imputed = self.imputer.fit_transform(X)
        skf = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
        cv_scores = cross_val_score(self.model, X_imputed, y, cv=skf, scoring='f1')
        
        print(f"\n{cv_folds}-Fold Cross-Validation Results:")
        print(f"   Mean F1-Score: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        print(f"   Individual scores: {[f'{score:.3f}' for score in cv_scores]}")
    
    def plot_feature_importance(self, top_n=15):
        importances = self.model.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        plt.figure(figsize=(12, 8))
        plt.title(f'Top {top_n} Most Important Features for {self.target_column}')
        
        top_indices = indices[:top_n]
        top_importances = importances[top_indices]
        top_features = [self.feature_names[i] for i in top_indices]
        
        plt.barh(range(len(top_features)), top_importances)
        plt.yticks(range(len(top_features)), top_features)
        plt.xlabel('Feature Importance')
        plt.gca().invert_yaxis()
        plt.tight_layout()
        
        if self.enable_plotting:
            plt.show()
        else:
            plt.close()  # Close figure to free memory
        
        print(f"\nTop 10 Most Important Features:")
        for i in range(min(10, len(top_features))):
            print(f"   {i+1}. {top_features[i]}: {top_importances[i]:.4f}")
    
    def plot_confusion_matrix(self, y_true, y_pred):
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title(f'Confusion Matrix - {self.target_column}')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        
        if self.enable_plotting:
            plt.show()
        else:
            plt.close()  # Close figure to free memory
    
    def plot_roc_curve(self, y_true, y_proba):
        fpr, tpr, _ = roc_curve(y_true, y_proba)
        auc = roc_auc_score(y_true, y_proba)
        
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {auc:.3f})')
        plt.plot([0, 1], [0, 1], 'k--', label='Random Classifier')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'ROC Curve - {self.target_column}')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        if self.enable_plotting:
            plt.show()
        else:
            plt.close()  # Close figure to free memory
    
    def predict_new_sample(self, new_data):
        if self.model is None:
            print("Model not trained yet.")
            return None
        
        new_data_imputed = self.imputer.transform(new_data)
        proba = self.model.predict_proba(new_data_imputed)[:, 1]
        predictions = (proba >= self.optimal_threshold).astype(int)
        
        return predictions, proba
    
    def save_model(self, model_dir=None, model_name=None):
        """
        Save the trained model and all necessary components to disk using joblib.
        
        Args:
            model_dir (str): Directory to save the model. If None, saves to ML_Model/saved_models/
            model_name (str): Name for the model file. If None, uses target_column name.
        
        Returns:
            str: Path to the saved model file
        """
        if self.model is None:
            raise ValueError("No trained model to save. Train the model first.")
        
        # Set default model directory
        if model_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_dir = os.path.join(current_dir, "saved_models")
        
        # Create directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
        
        # Set default model name
        if model_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            model_name = f"chronic_condition_model_{self.target_column}_{timestamp}.joblib"
        
        # Prepare model data to save
        model_data = {
            'model': self.model,
            'imputer': self.imputer,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'target_column': self.target_column,
            'optimal_threshold': self.optimal_threshold,
            'class_weights': self.class_weights,
            'missing_codes': self.missing_codes,
            'ccc_columns': self.ccc_columns,
            'model_version': self.model_version,
            'training_date': datetime.now().isoformat(),
            'enable_plotting': self.enable_plotting
        }
        
        # Save the model
        model_path = os.path.join(model_dir, model_name)
        joblib.dump(model_data, model_path, compress=3)
        
        print(f"Model saved successfully to: {model_path}")
        print(f"Model details:")
        print(f"  - Target condition: {self.target_column}")
        print(f"  - Features: {len(self.feature_names)} columns")
        print(f"  - Optimal threshold: {self.optimal_threshold:.3f}")
        print(f"  - Model version: {self.model_version}")
        
        return model_path
    
    def load_model(self, model_path):
        """
        Load a saved model and all necessary components from disk.
        
        Args:
            model_path (str): Path to the saved model file
        
        Returns:
            bool: True if loaded successfully, False otherwise
        """
        try:
            if not os.path.exists(model_path):
                print(f"Error: Model file not found at {model_path}")
                return False
            
            # Load the model data
            model_data = joblib.load(model_path)
            
            # Restore all components
            self.model = model_data['model']
            self.imputer = model_data['imputer']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.target_column = model_data['target_column']
            self.optimal_threshold = model_data['optimal_threshold']
            self.class_weights = model_data['class_weights']
            self.missing_codes = model_data['missing_codes']
            self.ccc_columns = model_data['ccc_columns']
            self.model_version = model_data.get('model_version', '1.0')
            self.training_date = model_data.get('training_date', 'Unknown')
            self.enable_plotting = model_data.get('enable_plotting', True)
            
            print(f"Model loaded successfully from: {model_path}")
            print(f"Model details:")
            print(f"  - Target condition: {self.target_column}")
            print(f"  - Features: {len(self.feature_names)} columns")
            print(f"  - Optimal threshold: {self.optimal_threshold:.3f}")
            print(f"  - Model version: {self.model_version}")
            print(f"  - Training date: {self.training_date}")
            
            return True
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    @classmethod
    def load_from_file(cls, model_path, enable_plotting=False):
        """
        Class method to create a new predictor instance and load a saved model.
        
        Args:
            model_path (str): Path to the saved model file
            enable_plotting (bool): Whether to enable plotting for this instance
        
        Returns:
            ChronicConditionPredictor: New instance with loaded model, or None if failed
        """
        predictor = cls(enable_plotting=enable_plotting)
        if predictor.load_model(model_path):
            return predictor
        else:
            return None

if __name__ == "__main__":
    print("Chronic Conditions ML Predictor")
    print("=" * 40)
    
    predictor = ChronicConditionPredictor()
    df = predictor.load_and_preprocess_data()  # Will use default path
    
    if df is None:
        print("Could not load data. Please check the file path.")
        exit()
    
    available_cccs = [col for col in predictor.ccc_columns if col in df.columns]
    print(f"\nAvailable chronic conditions to predict: {available_cccs}")
    
    print(f"\nChoose your approach:")
    print(f"   1. Analyze ONE condition in detail (recommended for learning)")
    print(f"   2. Analyze ALL {len(available_cccs)} conditions (comprehensive analysis)")
    
    choice = input(f"\nEnter your choice (1 or 2): ").strip()
    
    if choice == "2":
        results_summary = []
        
        for ccc in available_cccs:
            print(f"\n{'='*60}")
            print(f"PREDICTING {ccc}")
            print(f"{'='*60}")
            
            try:
                X, y = predictor.prepare_features_and_target(df, ccc)
                X_test, y_test = predictor.train_model(X, y)
                
                if X_test is not None:
                    y_proba = predictor.model.predict_proba(X_test)[:, 1]
                    y_pred = (y_proba >= predictor.optimal_threshold).astype(int)
                    f1 = f1_score(y_test, y_pred, zero_division=0)
                    accuracy = accuracy_score(y_test, y_pred)
                    results_summary.append({
                        'Condition': ccc,
                        'F1_Score': f1,
                        'Accuracy': accuracy,
                        'Threshold': predictor.optimal_threshold
                    })
                
            except Exception as e:
                print(f"Error predicting {ccc}: {str(e)}")
                results_summary.append({
                    'Condition': ccc,
                    'F1_Score': 0,
                    'Accuracy': 0,
                    'Threshold': 0.5
                })
        
        print(f"\n{'='*80}")
        print(f"SUMMARY OF ALL CHRONIC CONDITIONS")
        print(f"{'='*80}")
        print(f"{'Condition':<10} {'F1-Score':<10} {'Accuracy':<10} {'Threshold':<10}")
        print(f"{'-'*50}")
        for result in results_summary:
            print(f"{result['Condition']:<10} {result['F1_Score']:<10.3f} {result['Accuracy']:<10.3f} {result['Threshold']:<10.3f}")
    
    elif choice == "1" or choice == "":
        if available_cccs:
            ccc = available_cccs[0]
            print(f"\n{'='*60}")
            print(f"PREDICTING {ccc} (DETAILED ANALYSIS)")
            print(f"{'='*60}")
            
            try:
                X, y = predictor.prepare_features_and_target(df, ccc)
                X_test, y_test = predictor.train_model(X, y)
                
                if X_test is not None and len(X_test) > 0:
                    sample_pred, sample_proba = predictor.predict_new_sample(X_test[:1])
                    print(f"\nExample prediction:")
                    print(f"   Probability: {sample_proba[0]:.3f}")
                    print(f"   Prediction: {'Has condition' if sample_pred[0] == 1 else 'No condition'}")
                
            except Exception as e:
                print(f"Error predicting {ccc}: {str(e)}")
        else:
            print("No chronic condition columns found in the dataset!")
    
    else:
        print("Invalid choice. Running detailed analysis on first condition...")
    
    print(f"\nAnalysis complete!")
    print(f"\nTo predict different conditions, use:")
    print(f"   X, y = predictor.prepare_features_and_target(df, 'CCC_065')")
    print(f"   predictor.train_model(X, y)")