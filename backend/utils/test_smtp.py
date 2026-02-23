import smtplib
import os
import sys
from dotenv import load_dotenv

# Add the root directory to path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, SMTP_USE_TLS

def test_smtp():
    print("Starting SMTP Diagnostic Test...")
    print(f"Host: {SMTP_HOST}")
    print(f"Port: {SMTP_PORT}")
    print(f"User: {SMTP_USER}")
    print(f"TLS: {SMTP_USE_TLS or SMTP_PORT == 587}")
    
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Error: SMTP_USER or SMTP_PASSWORD is not set in .env")
        return

    try:
        print("\nConnecting to server...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
        
        if SMTP_USE_TLS or SMTP_PORT == 587:
            print("Starting TLS...")
            server.starttls()
            
        print(f"Attempting login for {SMTP_USER}...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        print("\nSMTP Authentication Successful!")
        print("Your credentials are correct and the server accepted them.")
        
        server.quit()
    except smtplib.SMTPAuthenticationError as e:
        print(f"\nAuthentication Failed: {e}")
        print("\nPossible solutions:")
        print("1. If using Gmail, you MUST use an 'App Password'.")
        print("2. Verify SMTP_USER is your full email address.")
        print("3. Check for typos in SMTP_PASSWORD (try removing spaces).")
    except Exception as e:
        print(f"\nSMTP Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    load_dotenv(override=True)
    test_smtp()
