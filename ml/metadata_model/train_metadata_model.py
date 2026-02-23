import os
import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# -----------------------------
# DATASET & MODEL PATHS
# -----------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CSV_PATH = os.path.join(PROJECT_ROOT, "dataset", "oral_cancer_prediction_dataset.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "metadata_risk_model.pkl")

df = pd.read_csv(CSV_PATH)
print("Dataset loaded:", df.shape)
binary_cols = [
    "Tobacco Use",
    "Alcohol Consumption",
    "Betel Quid Use",
    "HPV Infection",
    "Poor Oral Hygiene",
    "Oral Lesions",
    "Unexplained Bleeding",
    "Difficulty Swallowing",
    "White or Red Patches in Mouth",
    "Family History of Cancer"
]
for col in binary_cols:
    df[col] = df[col].map({"Yes": 1, "No": 0})
risk_score = (
    df["Tobacco Use"] * 2 +
    df["Alcohol Consumption"] * 1 +
    df["Betel Quid Use"] * 2 +
    df["HPV Infection"] * 2 +
    df["Poor Oral Hygiene"] * 1 +
    df["Oral Lesions"] * 2 +
    df["Unexplained Bleeding"] * 2 +
    df["Difficulty Swallowing"] * 2 +
    df["White or Red Patches in Mouth"] * 2 +
    df["Family History of Cancer"] * 1
)
noise = np.random.normal(0, 1.5, size=len(df))

df["High_Risk"] = ((risk_score + noise) >= 6).astype(int)
X = df[binary_cols + ["Age"]]
y = df["High_Risk"]
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)
model = RandomForestClassifier(
    n_estimators=120,
    max_depth=5,
    min_samples_split=30,
    min_samples_leaf=20,
    class_weight="balanced",
    random_state=42
)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print("\n===== METADATA RISK MODEL PERFORMANCE =====")
print("Accuracy:", round(accuracy_score(y_test, y_pred), 3))
print(classification_report(y_test, y_pred))

# Save alongside this script, so backend can load from
# ml/metadata_model/metadata_risk_model.pkl regardless of working directory
with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print(f"\n✅ Phase-3A Metadata Risk Model SAVED at: {MODEL_PATH}")
