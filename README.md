# OralCare AI (oral_pred)

An industry-ready AI-powered screening tool for oral health, combining deep learning image analysis with clinical metadata risk assessment.

## 🚀 Key Features (Industry Standards)

- **AI Fusion**: Combines CNN-based image prediction with random forest risk modeling.
- **Security-First Auth**: Database-backed OTP, email verification, and secure password hashing (BCrypt).
- **Accessibility (A11y)**: WCAG-compliant frontend elements with ARIA support.
- **Structured Logging**: Comprehensive backend logging for observability and debugging.
- **Clean Architecture**: Modular API design with separated concerns (ML, API, Utils).

## 🛠️ Project Structure

```bash
oral_pred/
├── backend/            # Flask API, Auth, Prediction Logic
├── frontend/           # Vite + React Dashboard
├── ml/                 # Machine Learning Models and Training Scripts
│   ├── image_model/    # CNN for image classification
│   └── metadata_model/ # Risk assessment from patient data
├── dataset/            # Training data (ignored by git)
└── uploads/            # Temporary storage for predictions
```

## ⚙️ Setup Instructions

### Backend

1.  Navigate to `backend/`.
2.  Install dependencies: `pip install -r requirements.txt`.
3.  Configure `.env` (Mongo URI, JWT Secret, SMTP settings).
4.  Run: `python app.py`.

### Frontend

1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Configure `src/config.js` for API endpoint.
4.  Run: `npm run dev`.

## 🛡️ Security & Compliance

- **Rate Limiting**: Protected auth endpoints.
- **Input Validation**: Strict regex and type checking for all inputs.
- **Secure Storage**: Tokens and verification links stored in MongoDB with TTLs.
- **Logging**: All security events (logins, registrations, errors) are logged to `backend.log`.

## 📜 API Documentation Summary

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login with email/password | No |
| `/api/predict` | POST | Upload image + metadata for AI analysis | Optional |
| `/api/history` | GET | View past prediction results | Yes |
| `/api/ursol` | POST | Chat with Ursol AI Assistant | Yes |

---
*Disclaimer: This tool is for screening assistance and not a substitute for professional medical diagnosis.*
