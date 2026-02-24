# fusion_predictor.py
import sys
import os
import pickle
import numpy as np

# Fix Python path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(BASE_DIR)

from ml.image_model.predict_image import predict_image

# ===============================
# LOAD METADATA MODEL
# ===============================

METADATA_MODEL_PATH = os.path.join(
    BASE_DIR, "ml", "metadata_model", "metadata_risk_model.pkl"
)

with open(METADATA_MODEL_PATH, "rb") as f:
    metadata_model = pickle.load(f)

print("✅ Fusion model loaded successfully")

# ===============================
# EXACT FEATURE ORDER (LOCKED)
# MUST MATCH TRAINING
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
    try:
        values = [metadata_dict[col] for col in FEATURE_COLUMNS]
    except KeyError as e:
        raise ValueError(f"Missing metadata field: {e}")

    X = np.array(values).reshape(1, -1)
    prob = metadata_model.predict_proba(X)[0][1]
    return float(prob)

# ===============================
# FUSION LOGIC
# ===============================

def fusion_predict(image_path, metadata_dict):
    img_prob = predict_image(image_path)
    meta_prob = predict_metadata(metadata_dict)

    # Weighted fusion (image more reliable)
    final_score = (0.65 * img_prob) + (0.35 * meta_prob)

    return {
        "image_probability": round(img_prob, 3),
        "metadata_probability": round(meta_prob, 3),
        "final_score": round(final_score, 3),
        "diagnosis": "Malignant" if final_score >= 0.5 else "Benign"
    }

if __name__ == "__main__":

    test_image = r"ml\fusion_model\image.png"

    test_metadata = {
        "Age": 52,
        "Gender": 1,
        "Tobacco Use": 1,
        "Alcohol Consumption": 1,
        "Betel Quid Use": 1,
        "Poor Oral Hygiene": 1,
        "Diet": 0,
        "Oral Lesions": 1,
        "Unexplained Bleeding": 1,
        "Difficulty Swallowing": 1,
        "White or Red Patches in Mouth": 1
    }

    result = fusion_predict(test_image, test_metadata)

    print("\n🔬 FINAL FUSION RESULT")
    for k, v in result.items():
        print(f"{k}: {v}")
