# import tensorflow as tf
# import numpy as np
# import cv2
# import os

# MODEL_PATH = "oral_cancer_cnn.h5"
# IMG_SIZE = 224

# # -----------------------------
# # Load model once
# # -----------------------------
# model = tf.keras.models.load_model(MODEL_PATH)
# print("✅ Image model loaded successfully")

# # -----------------------------
# # Preprocess function
# # -----------------------------
# def preprocess_image(img):
#     img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
#     img = img / 255.0
#     img = np.expand_dims(img, axis=0)
#     return img

# # -----------------------------
# # Predict from file
# # -----------------------------
# def predict_from_file(image_path):
#     if not os.path.exists(image_path):
#         print("❌ Image path not found!")
#         return

#     img = cv2.imread(image_path)
#     if img is None:
#         print("❌ Unable to read image file")
#         return

#     img = preprocess_image(img)

#     prob = model.predict(img)[0][0]
#     label = "Malignant" if prob >= 0.5 else "Benign"
#     confidence = prob if prob >= 0.5 else 1 - prob

#     print("\n🧠 FILE IMAGE RESULT")
#     print("Image:", os.path.basename(image_path))
#     print("Prediction:", label)
#     print("Confidence:", round(confidence * 100, 2), "%")


# # -----------------------------
# # Predict from camera
# # -----------------------------
# def predict_from_camera():
#     cap = cv2.VideoCapture(0)
#     print("\n📸 Press 'c' to capture | 'q' to quit")

#     while True:
#         ret, frame = cap.read()
#         cv2.imshow("Oral Cancer Screening Camera", frame)

#         key = cv2.waitKey(1)

#         if key == ord('c'):
#             img = preprocess_image(frame)
#             prob = model.predict(img)[0][0]

#             label = "Malignant" if prob >= 0.5 else "Benign"
#             confidence = prob if prob >= 0.5 else 1 - prob

#             print("\n🧠 CAMERA IMAGE RESULT")
#             print("Prediction:", label)
#             print("Confidence:", round(confidence * 100, 2), "%")

#         elif key == ord('q'):
#             break

#     cap.release()
#     cv2.destroyAllWindows()

# # -----------------------------
# # MAIN MENU
# # -----------------------------
# if __name__ == "__main__":
#     print("\nChoose Input Method:")
#     print("1. Image File")
#     print("2. Camera")

#     choice = input("Enter choice (1/2): ")

#     if choice == "1":
#         path = input("Enter image path: ").strip().strip('"').strip("'")
#         predict_from_file(path)

#     elif choice == "2":
#         predict_from_camera()

#     else:
#         print("❌ Invalid choice")
# predict_image.py
import tensorflow as tf
import numpy as np
import cv2
import os

IMG_SIZE = 224

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "oral_cancer_cnn.h5")

model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Image model loaded successfully")

def preprocess_image(img):
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    return img

def predict_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("❌ Image not found or unreadable")

    img = preprocess_image(img)
    prob = model.predict(img)[0][0]
    return float(prob)

