import os
from dotenv import load_dotenv

# Load .env from absolute path to be sure
_basedir = os.path.abspath(os.path.dirname(__file__))
_env_path = os.path.join(_basedir, ".env")
load_dotenv(_env_path, override=True)

# Debug prints to verify environment loading (visible in server console)
print(f"--- Environment Config Loaded (Override: True) ---")
print(f"Config Source Folder: {_basedir}")
print(f"SMTP_USER: {os.getenv('SMTP_USER')}")
print(f"SMTP_HOST: {os.getenv('SMTP_HOST')}")
print(f"--------------------------------------------------")

MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")
UPLOAD_FOLDER = "uploads"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = (os.getenv("GOOGLE_CLIENT_SECRET") or "").strip().rstrip("`")
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL") # e.g. https://oralcare-ciek.onrender.com

# SMTP (e.g. MailHog in Docker: host=localhost, port=1025, no auth)
SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
SMTP_USER = (os.getenv("SMTP_USER") or "").strip()
SMTP_PASSWORD = (os.getenv("SMTP_PASSWORD") or "").strip()
MAIL_FROM = os.getenv("MAIL_FROM", "noreply@solai.local")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "0").lower() in ("1", "true", "yes")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()