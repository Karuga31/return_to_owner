# route_auth.py

from flask import Blueprint, request, jsonify, current_app
from backend.models import db, User, LostItem
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps # Needed for middleware decorator

auth_bp = Blueprint("auth", __name__)

# =======================================================
# 1. JWT AUTHENTICATION MIDDLEWARE
# =======================================================

def token_required(f):
    """
    Middleware function to check for a valid JWT in the request headers.
    It decodes the token and attaches the user's data (id, role) to the request.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # JWT is typically passed in the Authorization header as 'Bearer <token>'
        if 'Authorization' in request.headers:
            try:
                auth_header = request.headers['Authorization']
                # Split 'Bearer' and the actual token
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            except Exception:
                # Handle cases where header format is wrong but exists
                return jsonify({'message': 'Authorization header format error'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Decode the token using the secret key
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            # Attach the decoded user data (user_id and role) to the request context
            request.user_id = data['user_id']
            request.user_role = data['role']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token is expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            # Catch other potential decoding errors
            return jsonify({'message': 'Token decoding failed'}), 401

        return f(*args, **kwargs)

    return decorated

# =======================================================
# EXISTING ROUTES (NO CHANGES NEEDED)
# =======================================================

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    # ... (existing register code) ...
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")
    
    # NOTE: You must restrict who can register admin/moderator roles in a real application!
    
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User exists"}), 409

    user = User(username=username, role=role, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Registered"}), 201


@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    # ... (existing login code) ...
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    print(f"LOGIN ATTEMPT: username={username}, password={password}")
    user = User.query.filter_by(username=username).first()
    print(f"User found: {user}")
    if not user:
        print("No user found with that username.")
    else:
        print(f"Password hash in DB: {user.password_hash}")
        print(f"Password check: {check_password_hash(user.password_hash, password)}")
    if not user or not check_password_hash(user.password_hash, password):
        print("Invalid credentials!")
        return jsonify({"error": "Invalid credentials"}), 401

    payload = {
        "user_id": user.id,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")
    print(f"Login successful for {username}")
    return jsonify({"token": token, "role": user.role, "username": user.username}), 200

# =======================================================
# EXAMPLE PROTECTED ROUTE (FOR TESTING)
# =======================================================

@auth_bp.route("/api/auth/test_protected", methods=["GET"])
@token_required # ⬅️ Protect the route using the middleware
def test_protected_route():
    """Returns the user's role if the token is valid."""
    # The request object now has 'request.user_id' and 'request.user_role'
    return jsonify({
        "message": "Access granted", 
        "user_id": request.user_id, 
        "role": request.user_role
    }), 200