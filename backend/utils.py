from functools import wraps
from flask import request, jsonify, current_app
import jwt
from models import User

def get_token_from_header():
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({"error": "Missing token"}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user = User.query.get(data["user_id"])
            if not user:
                return jsonify({"error": "User not found"}), 401
            request.user = user
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return wrapper

def require_role(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not getattr(request, "user", None):
                return jsonify({"error": "Auth required"}), 401
            if request.user.role not in allowed_roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
