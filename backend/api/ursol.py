from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
try:
    from google import genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

from config import GEMINI_API_KEY
import re

ursol_bp = Blueprint("ursol", __name__)

# Configure Gemini if API Key and Package are available
print(f"🤖 UrSol Initializing... (HAS_GEMINI={HAS_GEMINI}, KEY_PRESENT={bool(GEMINI_API_KEY)})")
if HAS_GEMINI and GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        # Dynamic Model Discovery with fix for attribute names
        available_models = []
        for m in client.models.list():
            # In the new SDK, we check if the model is a generation model
            # Usually naming convention or checking capabilities if present
            if "gemini" in m.name.lower():
                available_models.append(m.name)
        
        if available_models:
            # Prefer flash if available, otherwise take first
            GEMINI_MODEL = next((m for m in available_models if 'flash' in m.lower()), available_models[0])
            print(f"✅ UrSol Gemini Core Linked (Model: {GEMINI_MODEL})")
        else:
            print("⚠️ No generation models found for this API key")
            client = None
    except Exception as e:
        print(f"⚠️ UrSol Gemini Link Error: {e}")
        client = None
else:
    print("📢 UrSol running in Heuristic Fallback Mode")
    client = None

# Advanced Clinical Knowledge Base & Intent Engine (Fallback/Augmentation)
MEDICAL_CONTEXT = {
    "locations": {
        "mysore": "In **Mysore**, top specialists are available at **JSS Hospital** and **Narayana Multispeciality Clinic**. JP Nagar specifically has excellent primary diagnostic units. I recommend using our 'Hospital Discovery' tool pre-set for Mysore coordinates.",
        "bangalore": "In **Bangalore**, dedicated oncology centers like **HCG Cancer Centre** and **Mazumdar Shaw Medical Center** are world-class. You can find 20+ results in our Referral Network.",
        "default": "I can help you find specialists. Please grant location permissions to our 'Hospital Discovery' tool to see the nearest 10+ clinics in real-time."
    }
}

SYSTEM_PROMPT = """
You are UrSol, an Advanced Clinical AI Assistant specialized in Oral Oncology. 
Your mission is to guide users through the OralCare AI platform, explain diagnostic results, and provide empathetic clinical guidance.

Guidelines:
1. Empathy: Be professional yet compassionate.
2. Navigation: Always suggest relevant platform tools (Dashboard for vitals, Predict for new scans, History for records).
3. Safety: For persistent oral symptoms (>2 weeks), always recommend immediate clinical evaluation by an oncologist.
4. Locality: If the user mentions a location, mention that our 'Hospital Discovery' tool can find 10+ facilities near them.
5. Conciseness: Keep responses around 2-4 sentences unless explaining a complex medical concept.
"""

@ursol_bp.route("/chat", methods=["POST"])
def chat():
    data = request.json
    msg = data.get("message", "").lower()
    
    if not msg:
        return jsonify({"response": "I'm standing by, clinical lead. How can I assist with your diagnostic workflow?"})

    # Heuristic Location Check (Priority)
    locations = ["mysore", "bangalore", "mumbai", "delhi", "jp nagar"]
    found_location = next((loc for loc in locations if loc in msg), None)

    if client and GEMINI_API_KEY:
        try:
            # Combine System Prompt + User Message + Clinical Context if location found
            context_addition = ""
            if found_location:
                # Use a safe lookup since found_location could be None (handled by if-guard)
                loc_key = str(found_location)
                loc_info = MEDICAL_CONTEXT["locations"].get(loc_key, MEDICAL_CONTEXT["locations"]["default"])
                if loc_key == "jp nagar":
                    loc_info = MEDICAL_CONTEXT["locations"]["mysore"]
                context_addition = f"\nSpecific Context: {loc_info}"

            full_prompt = f"{SYSTEM_PROMPT}{context_addition}\n\nUser: {msg}\nUrSol:"
            # Ensure model is a string and contents is passed correctly
            response_data = client.models.generate_content(
                model=GEMINI_MODEL, 
                contents=full_prompt
            )
            response = response_data.text
        except Exception as e:
            print(f"❌ Gemini Runtime Error: {str(e)}")
            response = "I'm having trouble accessing my Large Language core, but I can still assist with platform navigation. Would you like to start a new screening or check your history?"
    else:
        # Fallback to Heuristic Engine if Gemini not configured
        if found_location:
             loc_key = str(found_location)
             loc_info = MEDICAL_CONTEXT["locations"].get(loc_key, MEDICAL_CONTEXT["locations"]["default"])
             if loc_key == "jp nagar": 
                 loc_info = MEDICAL_CONTEXT["locations"]["mysore"]
             response = f"I see you're inquiring about facilities near **{loc_key.upper()}**. {loc_info} Would you like me to open the Hospital Discovery tool for you?"
        elif any(word in msg for word in ["hello", "hi", "hey"]):
            response = "Greetings! I am **UrSol**, your clinical assistant. (Gemini core not active). I can help you navigate to 'Predict' or 'History'. How can I help?"
        else:
            response = "I'm in basic navigation mode. Please configure my Gemini AI core for advanced medical reasoning. For now, should I direct you to the screening portal?"

    return jsonify({
        "response": response,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "GEMINI_AI_ACTIVE" if client else "HEURISTIC_ACTIVE"
    })

@ursol_bp.route("/feedback", methods=["POST"])
def feedback():
    try:
        data = request.json
        if not data.get("feedback"):
            return jsonify({"error": "Feedback content required"}), 400
            
        feedback_doc = {
            "content": data["feedback"],
            "rating": data.get("rating"),
            "timestamp": datetime.utcnow(),
            "source": "UrSol_Gemini_AI"
        }
        
        if current_app.db is not None:
            current_app.db.feedback.insert_one(feedback_doc)
            return jsonify({"status": "success", "message": "Feedback securely archived. UrSol is learning from your input."})
        else:
            return jsonify({"error": "Database offline"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500
