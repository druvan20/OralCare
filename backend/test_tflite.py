import sys
import os
import io
import cv2
import numpy as np

# Mocking the request.files['image'].read() payload
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
sys.path.append(PROJECT_ROOT)

from api.predict import preprocess_image, get_image_model, run_tflite_inference

# Create a dummy image
img = np.zeros((224, 224, 3), dtype=np.uint8)
is_success, buffer = cv2.imencode(".jpg", img)
img_bytes = buffer.tobytes()

print("Testing preprocess_image...")
try:
    img_array = preprocess_image(img_bytes)
    print("Preprocess shape:", img_array.shape)
    
    print("Testing get_image_model...")
    interpreter = get_image_model()
    
    print("Testing inference...")
    prob = run_tflite_inference(interpreter, img_array)
    print("Inference prob:", prob)
except Exception as e:
    import traceback
    traceback.print_exc()
