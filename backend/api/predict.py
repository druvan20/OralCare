import sys
import os
import uuid
import json
import pickle
import cv2
import logging
import numpy as np
import base64
from datetime import datetime, timezone
import pandas as pd
from flask import Blueprint, request, jsonify, current_app

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    import tensorflow.lite as tflite
    
# config import no longer needs UPLOAD_FOLDER but it's safe to keep

logger = logging.getLogger(__name__)

# ===== FIX PYTHON PATH =====
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)
sys.path.append(PROJECT_ROOT)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from jwt import decode, InvalidTokenError
from utils.jwt_utils import _extract_token_from_header, get_jwt_key
from ml.fusion_model.fusion_logic import fuse_predictions

predict_bp = Blueprint("predict", __name__)

# ===== IMAGE MODEL =====
MODEL_PATH = os.path.join(
    PROJECT_ROOT, "ml", "image_model", "oral_cancer_cnn.tflite"
)
logger.info(f"🔍 Image model path: {MODEL_PATH}")
interpreter = None  # Lazy-loaded TFLite Interpreter

IMG_SIZE = 224
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ===== METADATA MODEL =====
META_MODEL_PATH = os.path.join(
    PROJECT_ROOT, "ml", "metadata_model", "metadata_risk_model.pkl"
)
metadata_model = None  # Lazy-loaded
def get_image_model():
    """Load and cache the TFLite interpreter on first use."""
    global interpreter
    if interpreter is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"TFLite model not found at {MODEL_PATH}. "
                f"Run ml/image_model/convert_to_tflite.py first."
            )
        interpreter = tflite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        logger.info("✅ TFLite Interpreter loaded successfully")
    return interpreter


def get_metadata_model():
    """Load and cache the metadata model on first use."""
    global metadata_model
    if metadata_model is None:
        if not os.path.exists(META_MODEL_PATH):
            raise FileNotFoundError(
                f"Metadata model not found at {META_MODEL_PATH}. "
                f"Train and save 'metadata_risk_model.pkl' (see ml/metadata_model/train_metadata_model.py)."
            )
        with open(META_MODEL_PATH, "rb") as f:
            metadata_model_local = pickle.load(f)
        metadata_model = metadata_model_local
        logger.info("✅ Metadata model loaded successfully")
    return metadata_model


# Upload folder is already defined in config and handled by app.py


# ---------- HELPERS ----------
def preprocess_image(img_bytes):
    """Preprocess raw bytes to float32 TFLite input array."""
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image bytes")
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    img = img.astype(np.float32) # TFLite requires exact typing
    img_array = np.expand_dims(img, axis=0)
    return img_array

def run_tflite_inference(interpreter, img_array):
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    interpreter.set_tensor(input_details[0]['index'], img_array)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    return float(output_data[0][0])


def predict_metadata(metadata_dict):
    """
    Selects exactly 11 features in the order they were trained.
    Maps internal keys to the human-readable strings expected by the Scikit-Learn model.
    """
    # Exact mapping from frontend/internal keys to the training dataset column names
    mapping = {
        "tobacco": "Tobacco Use",
        "alcohol": "Alcohol Consumption",
        "betel": "Betel Quid Use",
        "hpv": "HPV Infection",
        "hygiene": "Poor Oral Hygiene",
        "lesions": "Oral Lesions",
        "bleeding": "Unexplained Bleeding",
        "swallowing": "Difficulty Swallowing",
        "patches": "White or Red Patches in Mouth",
        "family": "Family History of Cancer",
        "age": "Age"
    }
    
    # Order must match exactly: binary_cols + ["Age"] in train_metadata_model.py
    feature_keys = [
        "tobacco", "alcohol", "betel", "hpv", "hygiene", 
        "lesions", "bleeding", "swallowing", "patches", "family", "age"
    ]
    
    try:
        # Create a dictionary with model-standard keys
        processed_data = {}
        for internal_key, model_key in mapping.items():
            val = metadata_dict.get(internal_key, 0)
            # Ensure it's numeric
            try:
                processed_data[model_key] = float(val)
            except (TypeError, ValueError):
                processed_data[model_key] = 0.0
        
        # Create DataFrame with model-standard columns in order
        model_columns = [mapping[k] for k in feature_keys]
        values = [processed_data[col] for col in model_columns]
        
        df = pd.DataFrame([values], columns=model_columns)
        
        model = get_metadata_model()
        prob = model.predict_proba(df)[0][1]
        return float(prob)
    except Exception as e:
        logger.error(f"❌ Metadata prediction failed: {e}")
        return 0.0


# ---------- API ----------
@predict_bp.route("", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "Image file missing"}), 400

    image = request.files["image"]
    if image.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not allowed_file(image.filename):
        return jsonify({"error": "File type not allowed. Please upload PNG or JPG."}), 400

    try:
        # Read raw bytes in memory (no disk usage)
        img_bytes = image.read()
        
        # Base64 encode for MongoDB (Data URL)
        mimetype = image.mimetype or "image/jpeg"
        b64_str = base64.b64encode(img_bytes).decode('utf-8')
        data_url = f"data:{mimetype};base64,{b64_str}"

        img_array = preprocess_image(img_bytes)
        interpreter = get_image_model()
        image_prob = run_tflite_inference(interpreter, img_array)

        image_result = "Malignant" if image_prob >= 0.5 else "Benign"

        metadata_prob = None
        metadata = None
        if "metadata" in request.form:
            metadata = json.loads(request.form["metadata"])
            metadata_prob = predict_metadata(metadata)

        fusion_output = fuse_predictions(
            image_prob=image_prob,
            metadata_prob=metadata_prob
        )
    except FileNotFoundError as e:
        logger.error(f"Model missing: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.exception("Prediction error")
        return jsonify({"error": "Prediction failed"}), 500
    finally:
        # Cleanup file if needed or keep for history (here we keep for now as it was before)
        pass

    user_id = None
    try:
        token = _extract_token_from_header()
        if token:
            decoded = decode(token, get_jwt_key(), algorithms=["HS256"])
            user_id = decoded.get("user_id")
    except InvalidTokenError:
        user_id = None

    if user_id is not None and getattr(current_app, "db", None) is not None:
        try:
            record = {
                "user_id": user_id,
                "image_result": image_result,
                "image_confidence": round(image_prob, 3),
                "metadata_probability": (
                    round(metadata_prob, 3) if metadata_prob is not None else None
                ),
                "final_score": fusion_output["final_score"],
                "final_decision": fusion_output["final_decision"],
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "image_url": data_url # ✅ Saves Base64 directly, never 404s
            }
            if metadata:
                record["metadata"] = metadata

            result = current_app.db.records.insert_one(record)
            logger.info(f"✅ Prediction history saved for user {user_id} (record ID: {result.inserted_id})")
        except Exception as e:
            logger.exception(f"❌ Failed to save prediction history for user {user_id}")

    return jsonify({
        "image_result": image_result,
        "image_confidence": round(image_prob, 3),
        "metadata_probability": (
            round(metadata_prob, 3) if metadata_prob is not None else None
        ),
        "final_score": fusion_output["final_score"],
        "final_decision": fusion_output["final_decision"]
    })

def secure_filename(filename):
    """Simple secure filename helper since we might not have werkzeug.utils.secure_filename"""
    return os.path.basename(filename).replace(" ", "_").replace("..", "")
