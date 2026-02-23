from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
import logging
from config import MONGO_URI, UPLOAD_FOLDER

# ✅ CONFIGURE LOGGING TO SUPPORT EMOJIS ON WINDOWS
import sys

# Ensure stream handler uses UTF-8 even on Windows console
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
try:
    # Python 3.7+ can set encoding on StreamHandler
    stream_handler.stream = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
except Exception:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        stream_handler,
        logging.FileHandler("backend.log", encoding="utf-8")
    ]
)
logger = logging.getLogger(__name__)

try:
    import certifi
    CA_FILE = certifi.where()
except ImportError:
    CA_FILE = None

from api.auth import auth_bp
from api.predict import predict_bp
from api.history import history_bp
from api.ursol import ursol_bp

# ✅ CREATE APP FIRST
app = Flask(__name__)
# In production, specify exact origins instead of wildcard or local-only
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Create uploads folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MongoDB connection (certifi fixes SSL handshake on Windows)
app.db = None
if MONGO_URI:
    try:
        masked_uri = MONGO_URI.split('@')[1] if '@' in MONGO_URI else 'local'
        logger.info(f"🔗 Connecting to MongoDB: {masked_uri}")
        # Short timeout so server starts even when Atlas is unreachable (SSL/network)
        kwargs = {"serverSelectionTimeoutMS": 5000, "connectTimeoutMS": 5000}
        if CA_FILE:
            kwargs["tlsCAFile"] = CA_FILE
        client = MongoClient(MONGO_URI, **kwargs)
        client.admin.command('ping')
        app.db = client["oral_cancer_db"]
        
        # ✅ CREATE TTL INDEXES FOR SECURITY (Auto-cleanup expired tokens)
        app.db.otp_store.create_index("expires_at", expireAfterSeconds=0)
        app.db.verify_tokens.create_index("expires_at", expireAfterSeconds=0)
        
        collections = app.db.list_collection_names()
        logger.info(f"📊 Collections: {collections or 'None (created on first insert)'}")
        logger.info("✅ MongoDB Atlas ready & TTL indexes verified")
    except Exception as e:
        logger.error(f"⚠️ MongoDB connection failed: {e}")
        logger.info("-" * 50)
        logger.info("🛠️ TROUBLESHOOTING TIPS:")
        logger.info("1. CHECK IP WHITELIST: Ensure your current IP is allowed in MongoDB Atlas (Network Access).")
        logger.info("2. CHECK CREDENTIALS: Verify MONGO_URI in .env matches your Atlas user/password.")
        logger.info("3. CHECK NETWORK: Ensure you are not behind a firewall/VPN blocking Atlas ports.")
        logger.info("4. RE-INSTALL CERTIFI: Run 'pip install --upgrade certifi'")
        logger.info("-" * 50)
        logger.warning("   Server will start; auth/history will return 503 until DB connects.")
else:
    logger.warning("⚠️ MONGO_URI not set in backend/.env")

app.register_blueprint(predict_bp, url_prefix="/api/predict")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(history_bp, url_prefix="/api/history")
app.register_blueprint(ursol_bp, url_prefix="/api/ursol")

@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/")
def home():
    return {"status": "Backend running"}

@app.route("/api/test-db", methods=["GET"])
def test_db():
    """Test endpoint to verify MongoDB connection and collections"""
    try:
        if app.db is None:
            return jsonify({"status": "error", "error": "MongoDB not connected"}), 503
        app.db.client.admin.command('ping')
        
        # Get collections
        collections = app.db.list_collection_names()
        
        # Count documents
        counts = {}
        for col_name in collections:
            counts[col_name] = app.db[col_name].count_documents({})
        
        return jsonify({
            "status": "connected",
            "database": app.db.name,
            "collections": collections,
            "document_counts": counts,
            "message": "MongoDB connection successful"
        })
    except Exception as e:
        logger.exception("Database test failed")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
    
