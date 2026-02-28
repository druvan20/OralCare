import tensorflow as tf
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
H5_MODEL_PATH = os.path.join(BASE_DIR, "oral_cancer_cnn.h5")
TFLITE_MODEL_PATH = os.path.join(BASE_DIR, "oral_cancer_cnn.tflite")

print(f"Loading model from {H5_MODEL_PATH}...")
try:
    # 1. Load the existing Keras model
    model = tf.keras.models.load_model(H5_MODEL_PATH)
    print("Model loaded successfully.")

    # 2. Convert to TFLite format
    print("Converting model to TFLite format...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optional: Apply quantization to make the model even smaller (good for free tiers)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    tflite_model = converter.convert()

    # 3. Save the TFLite model
    with open(TFLITE_MODEL_PATH, "wb") as f:
        f.write(tflite_model)
        
    print(f"✅ TFLite model saved successfully to {TFLITE_MODEL_PATH}")
    
    # Print size difference
    h5_size = os.path.getsize(H5_MODEL_PATH) / (1024 * 1024)
    tflite_size = os.path.getsize(TFLITE_MODEL_PATH) / (1024 * 1024)
    print(f"Original H5 Size: {h5_size:.2f} MB")
    print(f"New TFLite Size:  {tflite_size:.2f} MB")

except Exception as e:
    print(f"❌ Error during conversion: {e}")
