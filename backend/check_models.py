from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ No GEMINI_API_KEY found in .env")
else:
    try:
        client = genai.Client(api_key=api_key)
        print("🔍 Fetching available models...")
        for model in client.models.list():
            print(f"✅ Available: {model.name}")
    except Exception as e:
        print(f"❌ Error: {e}")
