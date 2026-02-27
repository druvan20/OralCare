import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, SMTP_USE_TLS, RESEND_API_KEY


def send_email(to_email, subject, body_text, body_html=None):
    """
    Send an email. 
    1. If RESEND_API_KEY exists, use Resend API (HTTP POST) - Bypasses Render's SMTP port blocks.
    2. Otherwise, fall back to standard SMTP.
    """
    if RESEND_API_KEY:
        try:
            print(f"📧 Attempting to send email via Resend API to {to_email}...")
            response = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"OralCare AI <onboarding@resend.dev>" if "resend.dev" in RESEND_API_KEY else MAIL_FROM,
                    "to": to_email,
                    "subject": subject,
                    "text": body_text,
                    "html": body_html,
                },
                timeout=10
            )
            if response.status_code in (200, 201):
                print(f"✅ Email sent successfully via Resend API to {to_email}")
                return True
            else:
                print(f"❌ Resend API Error: {response.status_code} - {response.text}")
                # Fall through to SMTP if API fails
        except Exception as e:
            print(f"❌ Resend API Exceptional Error: {e}")
            # Fall through to SMTP

    # --- SMTP Fallback ---
    if not SMTP_HOST or SMTP_HOST == "localhost":
        if not RESEND_API_KEY:
            print("⚠️ No RESEND_API_KEY and no real SMTP_HOST configured.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(body_text, "plain"))
    if body_html:
        msg.attach(MIMEText(body_html, "html"))

    use_tls = SMTP_USE_TLS or SMTP_PORT == 587
    
    # ... (rest of the SMTP logic remains as fallback)
    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if SMTP_USER and SMTP_PASSWORD:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(MAIL_FROM, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if use_tls:
                    server.starttls()
                if SMTP_USER and SMTP_PASSWORD:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(MAIL_FROM, [to_email], msg.as_string())
        print(f"✅ Email sent successfully via SMTP to {to_email}")
        return True
    except Exception as e:
        print(f"❌ SMTP Error: {e}")
        raise
