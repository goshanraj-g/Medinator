import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix
from sklearn.multioutput import MultiOutputClassifier
import joblib

df = pd.read_csv("DATA/filtered_data.csv")

X = df.drop(columns=[col for col in df.columns if col.startswith("CCC_")])

y = df[[col for col in df.columns if col.startswith("CCC_")]]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = MultiOutputClassifier(DecisionTreeClassifier(max_depth=5, random_state=42))

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

for i, col in enumerate(y.columns):
    cm = confusion_matrix(y_test.iloc[:, i], y_pred[:, i])
    print(f"Confusion matrix for {col}:\n{cm}\n")

joblib.dump(model, "ML_Model/health_decision_tree_multioutput.pkl")