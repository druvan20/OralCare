# backend/utils/fusion_utils.py
import sys
import os
import pickle
import numpy as np

# Fix path to access ml folder
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from ml.image_model.predict_image import predict_image

# ===============================
# LOAD METADATA MODEL
# ===============================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "metadata_model",
    "metadata_risk_model.pkl"
)

with open(MODEL_PATH, "rb") as f:
    metadata_model = pickle.load(f)

# ===============================
# FEATURE ORDER (MUST MATCH TRAINING)
# ===============================

FEATURE_COLUMNS = [
    "Age",
    "Gender",
    "Tobacco Use",
    "Alcohol Consumption",
    "Betel Quid Use",
    "Poor Oral Hygiene",
    "Diet",
    "Oral Lesions",
    "Unexplained Bleeding",
    "Difficulty Swallowing",
    "White or Red Patches in Mouth"
]

# ===============================
# METADATA PREDICTION
# ===============================

def predict_metadata(metadata_dict):
    values = [metadata_dict[col] for col in FEATURE_COLUMNS]
    X = np.array(values).reshape(1, -1)
    prob = metadata_model.predict_proba(X)[0][1]
    return float(prob)

# ===============================
# FUSION PREDICTION
# ===============================

def fusion_predict(image_path, metadata_dict):
    image_prob = predict_image(image_path)
    metadata_prob = predict_metadata(metadata_dict)

    final_score = (0.65 * image_prob) + (0.35 * metadata_prob)

    return {
        "diagnosis": "Malignant" if final_score >= 0.5 else "Benign",
        "final_score": round(final_score, 3),
        "image_probability": round(image_prob, 3),
        "metadata_probability": round(metadata_prob, 3)
    }
