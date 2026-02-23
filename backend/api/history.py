from flask import Blueprint, jsonify, current_app, request
from utils.jwt_utils import token_required

history_bp = Blueprint("history", __name__)

# Use empty string route so final path is exactly `/api/history`
# (avoids 308 redirects from `/api/history` -> `/api/history/` which break CORS preflight)
@history_bp.route("", methods=["GET", "OPTIONS"])
@token_required
def history(current_user):
    try:
        if current_app.db is None:
            return jsonify({"message": "Database unavailable. Try again later."}), 503
        records_collection = current_app.db.records
        user_id = request.user_id
        
        print(f"📊 Fetching history for user_id: {user_id}")
        print(f"📊 Collections available: {current_app.db.list_collection_names()}")
        
        records = list(records_collection.find({"user_id": user_id}))
        for r in records:
            r["_id"] = str(r["_id"])
        
        print(f"✅ Found {len(records)} records for user {user_id}")
        return jsonify(records)
    except Exception as e:
        print(f"❌ History fetch error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Failed to fetch history"}), 500
