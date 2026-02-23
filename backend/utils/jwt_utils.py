# Import from PyJWT (now properly installed)
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError

from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from bson import ObjectId
from config import JWT_SECRET

# Use at least 32-byte key for HS256 to avoid InsecureKeyLengthWarning (exported for predict.py)
def get_jwt_key():
    key = (JWT_SECRET or "").encode("utf-8")
    if len(key) < 32:
        key = key + b"\0" * (32 - len(key))
    return key


def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=1),
    }
    return encode(payload, get_jwt_key(), algorithm="HS256")


def _extract_token_from_header():
    """
    Extract bare JWT token from Authorization header.
    Supports both `Bearer <token>` and raw `<token>`.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return None

    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]

    # Fallback: treat the whole header as token
    return auth_header.strip() or None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # CORS preflight: browser sends OPTIONS without Authorization; allow it so actual GET succeeds
        if request.method == "OPTIONS":
            return "", 200

        token = _extract_token_from_header()

        if not token:
            return jsonify({"message": "Token missing"}), 401

        try:
            decoded = decode(token, get_jwt_key(), algorithms=["HS256"])
            request.user_id = decoded["user_id"]
        except ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        if current_app.db is None:
            return jsonify({"message": "Database unavailable"}), 503

        user = current_app.db.users.find_one({"_id": ObjectId(decoded["user_id"])})
        if not user:
            return jsonify({"message": "User not found"}), 401

        return f(current_user=user, *args, **kwargs)

    return decorated
