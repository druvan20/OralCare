import logging
from flask import Blueprint, request, jsonify, current_app, redirect
import bcrypt
import secrets
import re
import time
import requests
from urllib.parse import urlencode
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL, BACKEND_URL
from utils.jwt_utils import generate_token

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__)

OTP_EXPIRY_SECONDS = 600  # 10 minutes
VERIFY_EXPIRY_SECONDS = 3600  # 1 hour

def _get_otp_collection():
    return current_app.db.otp_store

def _get_verify_collection():
    return current_app.db.verify_tokens

def _send_verification_email(email, verification_link):
    """Send verification link via SMTP. Link should point to backend /api/auth/verify-email?token=..."""
    try:
        from utils.email_sender import send_email
        subject = "Verify your OralCare AI account"
        link = verification_link
        text = f"Click the link below to verify your email:\n\n{link}\n\nThis link expires in 1 hour.\n\n— OralCare AI"
        html = f"<p>Click the link below to verify your email:</p><p><a href=\"{link}\">{link}</a></p><p>This link expires in 1 hour.</p><p>— OralCare AI</p>"
        send_email(email, subject, text, html)
        return True, None
    except Exception as e:
        logger.error(f"⚠️ Failed to send verification email to {email}: {e}")
        return False, str(e)


def _send_otp_email(email, otp):
    """Send 6-digit OTP via SMTP."""
    try:
        from utils.email_sender import send_email
        subject = "Your OralCare AI login code"
        text = f"Your verification code is: {otp}\n\nValid for 10 minutes.\n\n— OralCare AI"
        html = f"<p>Your verification code is: <strong>{otp}</strong></p><p>Valid for 10 minutes.</p><p>— OralCare AI</p>"
        send_email(email, subject, text, html)
        return True
    except Exception as e:
        logger.error(f"⚠️ Failed to send OTP email to {email}: {e}")
        return False


# ----- Google OAuth -----
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@auth_bp.route("/google", methods=["GET"])
def google_login():
    """Redirect to Google consent if configured, else show message."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return redirect(f"{FRONTEND_URL}/login?message=Google+sign-in+not+configured.+Add+GOOGLE_CLIENT_ID+and+GOOGLE_CLIENT_SECRET+to+.env")
    state = secrets.token_urlsafe(16)
    base_url = BACKEND_URL.rstrip('/') if BACKEND_URL else request.url_root.rstrip('/')
    # Force https if we know we are on a secure domain
    if BACKEND_URL and BACKEND_URL.startswith("https"):
        base_url = base_url.replace("http://", "https://")
        
    redirect_uri = f"{base_url}/api/auth/google/callback"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    logger.info(f"🚀 Initiating Google Login. Redirect URI: {redirect_uri}")
    return redirect(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    """Exchange code for tokens, get user info, create/find user, issue JWT, redirect to frontend."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return redirect(f"{FRONTEND_URL}/login?message=Google+sign-in+not+configured")

    base_url = BACKEND_URL.rstrip('/') if BACKEND_URL else request.url_root.rstrip('/')
    if BACKEND_URL and BACKEND_URL.startswith("https"):
        base_url = base_url.replace("http://", "https://")

    redirect_uri = f"{base_url}/api/auth/google/callback"
    
    logger.info(f"📥 Google Callback hit. Args: {dict(request.args)}")
    logger.info(f"🔗 Using Redirect URI for exchange: {redirect_uri}")

    code = request.args.get("code")
    error = request.args.get("error")
    if error:
        logger.error(f"❌ Google OAuth error: {error}")
        return redirect(f"{FRONTEND_URL}/login?message=Google+sign-in+cancelled+or+failed")
    if not code:
        logger.warning("⚠️ No authorization code received in callback.")
        return redirect(f"{FRONTEND_URL}/login?message=Missing+authorization+code")

    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    try:
        r = requests.post(GOOGLE_TOKEN_URL, data=data, headers=headers, timeout=10)
        r.raise_for_status()
        token_res = r.json()
    except Exception as e:
        print("Google token exchange error:", e)
        return redirect(f"{FRONTEND_URL}/login?message=Google+token+exchange+failed")

    access_token = token_res.get("access_token")
    if not access_token:
        return redirect(f"{FRONTEND_URL}/login?message=No+access+token+from+Google")

    try:
        user_r = requests.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        user_r.raise_for_status()
        google_user = user_r.json()
    except Exception as e:
        print("Google userinfo error:", e)
        return redirect(f"{FRONTEND_URL}/login?message=Failed+to+get+Google+profile")

    email = google_user.get("email")
    name = google_user.get("name") or google_user.get("email", "").split("@")[0]
    if not email:
        return redirect(f"{FRONTEND_URL}/login?message=Google+account+has+no+email")

    if current_app.db is None:
        return redirect(f"{FRONTEND_URL}/login?message=Database+unavailable")

    users = current_app.db.users
    user = users.find_one({"email": email})
    if not user:
        users.insert_one({
            "name": name,
            "email": email,
            "password": b"",  # no password for OAuth-only users
            "google_id": google_user.get("id"),
            "email_verified": True,
            "created_at": time.time()
        })
        user = users.find_one({"email": email})
    else:
        # Update existing user if they don't have google_id yet
        if not user.get("google_id"):
            users.update_one(
                {"_id": user["_id"]}, 
                {"$set": {"google_id": google_user.get("id"), "email_verified": True}}
            )

    token = generate_token(str(user["_id"]))
    # Redirect to frontend with token in hash so it is not sent to server logs
    return redirect(f"{FRONTEND_URL}/dashboard#token={token}")


@auth_bp.route("/facebook", methods=["GET"])
def facebook_login():
    """Redirect to frontend; Facebook OAuth can be added similarly with FACEBOOK_APP_ID."""
    return redirect(f"{FRONTEND_URL}/login?message=Facebook+sign-in+coming+soon.+Use+Google+or+email.")

# ----- Validation Helpers -----
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_strong_password(password):
    # Min 8 chars, at least one letter and one number
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isalpha() for c in password)


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({"message": "Request body is required"}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({"message": "Name, email, and password are required"}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        if not is_strong_password(password):
            return jsonify({"message": "Password must be at least 8 characters and contain both letters and numbers"}), 400

        if current_app.db is None:
            return jsonify({"message": "Database unavailable. Try again later."}), 503

        users = current_app.db.users

        existing_user = users.find_one({"email": data["email"]})
        if existing_user:
            if not existing_user.get("email_verified", False):
                email_addr = data["email"].strip().lower()
                token = secrets.token_urlsafe(32)
                _get_verify_collection().update_one(
                    {"email": email_addr},
                    {"$set": {"token": token, "expires_at": time.time() + VERIFY_EXPIRY_SECONDS}},
                    upsert=True
                )
                verification_link = f"{request.url_root.rstrip('/')}/api/auth/verify-email?token={token}"
                logger.info(f"🔄 Resending verification to unverified user: {email_addr}")
                if _send_verification_email(email_addr, verification_link):
                    return jsonify({"message": "Verification email resent. Please check your inbox."}), 201
                else:
                    return jsonify({"message": "Account exists but verification email failed to send. Check SMTP."}), 503
            return jsonify({"message": "User already exists"}), 400

        hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())

        doc = {
            "name": data["name"],
            "email": data["email"],
            "password": hashed,
            "email_verified": False,
        }
        result = users.insert_one(doc)
        logger.info(f"✅ User registered: {data['email']} (ID: {result.inserted_id})")

        # Send verification email
        email_addr = data["email"].strip().lower()
        token = secrets.token_urlsafe(32)
        _get_verify_collection().insert_one({
            "email": email_addr,
            "token": token,
            "expires_at": time.time() + VERIFY_EXPIRY_SECONDS
        })
        verification_link = f"{request.url_root.rstrip('/')}/api/auth/verify-email?token={token}"
        if _send_verification_email(email_addr, verification_link):
            logger.info(f"📧 Verification email sent to {email_addr}")
        else:
            logger.warning(f"📧 Verification email skipped (check SMTP). Full link for dev:\n  {verification_link}")

        return jsonify({"message": "Registered successfully"}), 201
    except Exception as e:
        logger.exception(f"Registration error: {e}")
        return jsonify({"message": "Registration failed"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"message": "Request body is required"}), 400

        if not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password are required"}), 400

        if current_app.db is None:
            return jsonify({"message": "Database unavailable. Try again later."}), 503

        users = current_app.db.users
        
        # Debug: List all users (for troubleshooting)
        all_users = list(users.find({}, {"email": 1, "name": 1}))
        print(f"🔍 All users in database: {[u.get('email') for u in all_users]}")
        print(f"🔍 Searching for email: '{data['email']}'")

        user = users.find_one({"email": data["email"]})
        if not user:
            logger.warning(f"❌ Login failed: User not found - '{data['email']}'")
            return jsonify({"message": "Invalid credentials"}), 401
        
        logger.info(f"✅ User found: {data['email']} (ID: {user['_id']})")

        # Handle password hash normalization
        stored_password = user.get("password")
        
        # Check if account has a password set (e.g. not a Google-only account)
        if not stored_password or stored_password == b"":
             return jsonify({
                "message": "This account was created using Google Login. Please click 'Continue with Google' to sign in."
            }), 401

        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')

        try:
            if not bcrypt.checkpw(data["password"].encode('utf-8'), stored_password):
                logger.warning(f"❌ Login failed: Incorrect password for '{data['email']}'")
                return jsonify({"message": "Invalid credentials"}), 401
        except ValueError as e:
            logger.error(f"❌ Password check error for {data['email']}: {e}")
            return jsonify({
                "message": "Account security issue. Please contact support or reset your password."
            }), 500

        # Block unverified accounts
        if not user.get("email_verified", False):
            logger.warning(f"⚠️ Login blocked: email not verified for '{data['email']}'")
            # Proactively resend verification link
            token = secrets.token_urlsafe(32)
            _get_verify_collection().update_one(
                {"email": data['email'].strip().lower()},
                {"$set": {"token": token, "expires_at": time.time() + VERIFY_EXPIRY_SECONDS}},
                upsert=True
            )
            v_link = f"{request.url_root.rstrip('/')}/api/auth/verify-email?token={token}"
            _send_verification_email(data['email'], v_link)
            
            return jsonify({
                "message": "Please verify your email. We just sent a new link to your inbox.",
                "email_unverified": True,
                "email": user.get("email", "")
            }), 403

        token = generate_token(str(user["_id"]))
        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "role": user.get("role", "user"),
                "email_verified": user.get("email_verified", False)
            }
        }), 200
    except Exception as e:
        logger.exception(f"Login error: {e}")
        return jsonify({"message": "Login failed"}), 500


# ----- Email verification -----
@auth_bp.route("/resend-verify", methods=["POST"])
@auth_bp.route("/resend_verify", methods=["POST"])
def resend_verify():
    """Resend email verification link via SMTP."""
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"message": "Email is required"}), 400

    token = secrets.token_urlsafe(32)
    _get_verify_collection().update_one(
        {"email": email},
        {"$set": {"token": token, "expires_at": time.time() + VERIFY_EXPIRY_SECONDS}},
        upsert=True
    )
    verification_link = f"{request.url_root.rstrip('/')}/api/auth/verify-email?token={token}"
    success, error_msg = _send_verification_email(email, verification_link)
    if success:
        logger.info(f"📧 Verification email sent to {email}")
        return jsonify({"message": "Verification email sent. Check your inbox and spam folder."}), 200
    
    logger.error(f"❌ Resend failed for {email}: {error_msg}")
    return jsonify({
        "message": "Could not send email. Check SMTP settings.",
        "debug_error": error_msg
    }), 503


@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():
    """Validate token, set user email_verified=True, and Magic Login (Redirect to frontend with JWT)."""
    token = request.args.get("token")
    if not token:
        return redirect(f"{FRONTEND_URL}/login?message=Missing+token")

    verify_doc = _get_verify_collection().find_one({"token": token})
    if not verify_doc:
        return redirect(f"{FRONTEND_URL}/login?message=Invalid+or+expired+link")

    if time.time() > verify_doc.get("expires_at", 0):
        return redirect(f"{FRONTEND_URL}/login?message=Link+expired")

    email = verify_doc["email"]
    users = current_app.db.users
    user = users.find_one({"email": email})

    if user:
        # Mark as verified
        users.update_one({"_id": user["_id"]}, {"$set": {"email_verified": True}})
        
        # MAGIC LOGIN: Generate JWT and redirect to frontend
        jwt_token = generate_token(str(user["_id"]))
        redirect_url = f"{FRONTEND_URL}/login?token={jwt_token}"
        
        # Cleanup token
        _get_verify_collection().delete_one({"token": token})
        
        logger.info(f"✅ User {email} magic logged in via link.")
        return redirect(redirect_url)
    
    return redirect(f"{FRONTEND_URL}/login?message=User+not+found")


# ----- Password Reset -----
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Generate reset token and send email."""
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"message": "Email is required"}), 400

    if current_app.db is None:
        return jsonify({"message": "Database unavailable"}), 503

    users = current_app.db.users
    user = users.find_one({"email": email})
    
    # Generate secure token
    token = secrets.token_urlsafe(32)
    
    if user:
        # Store in user document. Expiry 1 hour
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"reset_token": token, "reset_expires": time.time() + 3600}}
        )

        # MAGIC RESET LINK: Use the verify-email endpoint logic to auto-verify and login
        # We store this in verify collection too so it acts as a magic login
        _get_verify_collection().update_one(
            {"email": email},
            {"$set": {"token": token, "expires_at": time.time() + 3600}},
            upsert=True
        )

        magic_link = f"{request.url_root.rstrip('/')}/api/auth/verify-email?token={token}"
        
        try:
            from utils.email_sender import send_email
            subject = "Magic Access: Login to OralCare AI"
            text = f"Click the link below to access your account immediately (and verify your email):\n\n{magic_link}\n\nValid for 1 hour.\n\n— OralCare AI"
            html = f'<p>Click the link below to access your account immediately (and verify your email):</p><p><b><a href="{magic_link}" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Login Automatically</a></b></p><p>Valid for 1 hour.</p><p>— OralCare AI</p>'
            send_email(email, subject, text, html)
            print(f"✅ Magic reset email sent to {email}")
        except Exception as e:
            print(f"❌ Magic reset email failed for {email}: {e}")
            # We still return 200 to not leak existence, but log error
    else:
        print(f"🔍 Forgot password requested for non-existent email: {email}")
            
    # Always return success to prevent enumeration
    return jsonify({"message": "If that email exists, we sent a reset link."}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Verify token and set new password."""
    data = request.json or {}
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"message": "Token and new password are required"}), 400

    if current_app.db is None:
        return jsonify({"message": "Database unavailable"}), 503

    users = current_app.db.users
    user = users.find_one({"reset_token": token})

    if not user:
        return jsonify({"message": "Invalid or expired token"}), 400

    if time.time() > user.get("reset_expires", 0):
        return jsonify({"message": "Token expired"}), 400

    # Hash new password
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

    users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": hashed},
            "$unset": {"reset_token": "", "reset_expires": ""}
        }
    )
    logger.info(f"✅ Password reset successful for user {user['_id']}")
    return jsonify({"message": "Password reset successfully. You can login now."}), 200




# ----- User Profile -----

from utils.jwt_utils import token_required
from bson import ObjectId

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    """Return current user details."""
    return jsonify({
        "id": str(current_user["_id"]),
        "name": current_user.get("name", ""),
        "email": current_user.get("email", ""),
        "email_verified": current_user.get("email_verified", False)
    }), 200

@auth_bp.route("/update-profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    """Update user profile (name, email)."""
    data = request.json
    if not data:
        return jsonify({"message": "Request body is required"}), 400

    updates = {}
    if "name" in data:
        updates["name"] = data["name"].strip()
    if "email" in data:
        email = data["email"].strip().lower()
        if email and email != current_user.get("email"):
            # Check if email is already taken
            if current_app.db.users.find_one({"email": email}):
                return jsonify({"message": "Email already in use"}), 400
            updates["email"] = email
            updates["email_verified"] = False  # Reset verification if email changes

    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400

    try:
        current_app.db.users.update_one({"_id": current_user["_id"]}, {"$set": updates})
        
        # Return updated user
        updated_user = current_app.db.users.find_one({"_id": current_user["_id"]})
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": str(updated_user["_id"]),
                "name": updated_user.get("name", ""),
                "email": updated_user.get("email", ""),
                "email_verified": updated_user.get("email_verified", False)
            }
        }), 200
    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({"message": "Failed to update profile"}), 500
