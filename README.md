# OralCare AI 

## 🎯 About The Project
Oral cancer is one of the most common and life-threatening cancers globally, but early detection significantly improves survival rates. **OralCare AI** was built to bridge the gap between patients and immediate preliminary diagnosis. By allowing users to upload images of oral cavities and provide clinical metadata, this tool acts as an accessible early-warning system.

**Project Aim:** Our goal is to democratize preliminary oral health screening using an industry-ready AI platform. It combines deep learning image analysis with clinical metadata risk assessment to provide quick, reliable, and accessible insights, encouraging users to seek professional medical help early.
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

Follow these steps for any developer to get the code running locally on their machine.

### Prerequisites
- **Python 3.9+**
- **Node.js v16+**
- **MongoDB** ( MongoDB Atlas Cluster)
- **Groq API Key** (Required for the UrSol AI Chatbot)
- **SMTP Email Credentials** (For user OTP/Email verification)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/
   ```
2. Create and activate a Virtual Environment (Recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your Environment Variables. Create a `.env` file in the `backend/` folder and add:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   MAIL_FROM=your_email@gmail.com
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   ```
5. Start the backend Flask server:
   ```bash
   python app.py
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend/
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

## 🛡️ Security & Compliance

- **Rate Limiting**: Protected auth endpoints.
- **Input Validation**: Strict regex and type checking for all inputs.
- **Secure Storage**: Tokens and verification links stored in MongoDB with TTLs.
- **Logging**: All security events (logins, registrations, errors) are logged to `backend.log`.

## 📜 API Documentation Summary

### 🔐 Authentication & User Management
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Register a new user account | No |
| `/api/auth/login` | POST | Login with email and password | No |
| `/api/auth/google` | GET | Initiate Google OAuth SSO flow | No |
| `/api/auth/facebook` | GET | Initiate Facebook OAuth SSO flow | No |
| `/api/auth/verify-email` | GET | Verify user email with token | No |
| `/api/auth/resend-verify`| POST | Resend verification email link | No |
| `/api/auth/forgot-password`| POST | Request a password reset link | No |
| `/api/auth/reset-password`| POST | Reset password using token | No |
| `/api/auth/me` | GET | Get current logged-in user profile | Yes |
| `/api/auth/update-profile`| PUT | Update user profile details | Yes |

### 🔬 Prediction & Records
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/predict` | POST | Upload image + clinical data for cancer risk analysis | Optional |
| `/api/history` | GET | View history of past screening results | Yes |

### 🤖 UrSol AI Assistant
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/ursol/chat` | POST | Chat with the Groq Llama-3 medical assistant | Optional |
| `/api/ursol/feedback` | POST | Submit feedback on UrSol AI responses | Optional |

---
*Disclaimer: This tool is for screening assistance and not a substitute for professional medical diagnosis.*
