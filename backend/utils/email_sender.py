import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, SMTP_USE_TLS, RESEND_API_KEY, BREVO_API_KEY


def send_email(to_email, subject, body_text, body_html=None):
    """
    Send an email. 
    1. If BREVO_API_KEY exists, use Brevo API (HTTP POST) - Highly recommended for free tiers.
    2. If RESEND_API_KEY exists, use Resend API.
    3. Otherwise, fall back to standard SMTP.
    """
    # --- 1. Brevo API (Strongly Recommended) ---
    if BREVO_API_KEY:
        try:
            print(f"📧 Attempting to send email via Brevo API to {to_email}...")
            # Use Brevo V3 API
            response = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": BREVO_API_KEY,
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                json={
                    "sender": {"name": "OralCare AI", "email": MAIL_FROM},
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "textContent": body_text,
                    "htmlContent": body_html if body_html else body_text
                },
                timeout=10
            )
            if response.status_code in (200, 201, 202):
                print(f"✅ Email sent successfully via Brevo API to {to_email}")
                return True
            else:
                print(f"❌ Brevo API Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Brevo API Exceptional Error: {e}")

    # --- 2. Resend API ---
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
                    "from": "OralCare AI <onboarding@resend.dev>",
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
        except Exception as e:
            print(f"❌ Resend API Exceptional Error: {e}")

    # --- 3. SMTP Fallback ---
    if not SMTP_HOST or SMTP_HOST == "localhost":
        if not (RESEND_API_KEY or BREVO_API_KEY):
            print("⚠️ No API Key and no real SMTP_HOST configured.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(body_text, "plain"))
    if body_html:
        msg.attach(MIMEText(body_html, "html"))

    use_tls = SMTP_USE_TLS or SMTP_PORT == 587
    
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
