from functools import wraps
from flask import request, jsonify, current_app
import jwt
from .models import User
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


# =====================================================
#   EMAIL NOTIFICATION FUNCTION  
# =====================================================
def send_notification_email(recipient_email, item_name, new_status):
    """
    Sends an email notification to the recipient about the item status change.
    """
    try:
        server = current_app.config['MAIL_SERVER']
        port = current_app.config['MAIL_PORT']
        username = current_app.config['MAIL_USERNAME']
        password = current_app.config['MAIL_PASSWORD']
        sender = username

        if not all([server, port, username, password]):
            print("ERROR: Missing mail configuration.")
            return False

        # Email templates
        if new_status == 'approved':
            subject = f"✅ Success: Your Item '{item_name}' Has Been Found!"
            body = f"""
            Dear User,

            Great news! The item you reported, '{item_name}', has been officially FOUND 
            and approved by the admin.

            Please contact the office to arrange for pickup.

            Thank you for using the Lost and Found System.
            """
        elif new_status == 'pending':
            subject = f"⏳ Update: Your Item '{item_name}' is Under Review"
            body = f"""
            Dear User,

            Your item '{item_name}' is currently being reviewed by the admin.

            You will receive further updates soon.

            Thank you for your patience.
            """
        else:
            return False

        msg = MIMEMultipart()
        msg['From'] = sender
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL(server, port) as smtp:
            smtp.login(username, password)
            smtp.sendmail(sender, recipient_email, msg.as_string())

        return True

    except Exception as e:
        print(f"Failed to send email → {recipient_email}. Error: {e}")
        return False



# =====================================================
#   AUTH HELPERS
# =====================================================
def get_token_from_header():
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None



# =====================================================
#   REQUIRE AUTH
# =====================================================
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({"error": "Missing Authorization token"}), 401

        try:
            payload = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"]
            )

            user = User.query.get(payload.get("id"))
            if not user:
                return jsonify({"error": "User not found"}), 404

            request.user = {
                "id": user.id,
                "email": user.email,
                "role": user.role
            }

        except Exception as e:
            print("JWT decode error:", e)
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated



# =====================================================
#   REQUIRE ROLE (supports MULTIPLE roles)
# =====================================================
def require_role(*allowed_roles):
    """
    Usage:
    @require_role("admin")
    @require_role("super_admin", "moderator")
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):

            user = getattr(request, "user", None)

            if not user:
                return jsonify({"error": "Unauthorized"}), 401

            user_role = user.get("role")

            if user_role not in allowed_roles:
                return jsonify({
                    "error": "Forbidden — Insufficient role",
                    "your_role": user_role,
                    "allowed_roles": allowed_roles
                }), 403

            return f(*args, **kwargs)

        return wrapper
    return decorator

