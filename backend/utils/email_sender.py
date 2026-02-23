"""Send email via SMTP. Works with MailHog (Docker), Gmail (587+STARTTLS), and others."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, SMTP_USE_TLS


def send_email(to_email, subject, body_text, body_html=None):
    """
    Send an email. Returns True on success, raises on failure.
    - MailHog: host=localhost, port=1025, no auth.
    - Gmail: host=smtp.gmail.com, port=587, SMTP_USE_TLS=1, user + app password.
    - Port 465 uses SSL; port 587 uses STARTTLS (auto if SMTP_USE_TLS=1 or port 587).
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to_email

    msg.attach(MIMEText(body_text, "plain"))
    if body_html:
        msg.attach(MIMEText(body_html, "html"))

    use_tls = SMTP_USE_TLS or SMTP_PORT == 587

    if SMTP_PORT == 465:
        try:
            print(f"📧 Attempting SMTP_SSL connection to {SMTP_HOST}:{SMTP_PORT}...")
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if SMTP_USER and SMTP_PASSWORD:
                    print(f"🔑 Authenticating as {SMTP_USER}...")
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(MAIL_FROM, [to_email], msg.as_string())
            print(f"✅ Email sent successfully to {to_email}")
        except smtplib.SMTPAuthenticationError:
            print(f"❌ SMTP_SSL Authentication Failed: Check SMTP_USER and SMTP_PASSWORD.")
            raise
        except smtplib.SMTPConnectError:
            print(f"❌ SMTP_SSL Connection Failed: Could not connect to {SMTP_HOST}:{SMTP_PORT}")
            raise
        except Exception as e:
            print(f"❌ SMTP_SSL Unexpected Error: {e}")
            import traceback
            traceback.print_exc()
            raise
    else:
        try:
            print(f"📧 Attempting SMTP connection to {SMTP_HOST}:{SMTP_PORT} (TLS: {use_tls})...")
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if use_tls:
                    server.starttls()
                if SMTP_USER and SMTP_PASSWORD:
                    print(f"🔑 Authenticating as {SMTP_USER}...")
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(MAIL_FROM, [to_email], msg.as_string())
            print(f"✅ Email sent successfully to {to_email}")
        except smtplib.SMTPAuthenticationError:
            print(f"❌ SMTP Authentication Failed: Check SMTP_USER and SMTP_PASSWORD.")
            raise
        except smtplib.SMTPConnectError:
            print(f"❌ SMTP Connection Failed: Could not connect to {SMTP_HOST}:{SMTP_PORT}")
            raise
        except Exception as e:
            print(f"❌ SMTP Unexpected Error: {e}")
            import traceback
            traceback.print_exc()
            raise
    return True
