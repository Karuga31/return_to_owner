from flask import Blueprint, request, jsonify
from backend.models import db, User, LostItem
from backend.utils import require_auth, require_role

admin_bp = Blueprint("admin", __name__)

SUPER_ADMIN = "super_admin"
MODERATOR = "moderator"
ANALYST = "analyst"

# ----------------------------------------------------------
# System Analytics (admin, super_admin, analyst)
# ----------------------------------------------------------
@admin_bp.route("/api/admin/analytics", methods=["GET"])
@require_auth
@require_role("admin", SUPER_ADMIN, ANALYST)
def system_analytics():
    try:
        # Example analytics: count users, count items, count found items
        user_count = User.query.count()
        item_count = LostItem.query.count()
        found_count = LostItem.query.filter_by(status="found").count()
        stats = {
            "total_users": user_count,
            "total_items": item_count,
            "found_items": found_count
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
from flask import Blueprint, request, jsonify
from backend.models import db, User, LostItem
from backend.utils import require_auth, require_role

admin_bp = Blueprint("admin", __name__)

SUPER_ADMIN = "super_admin"
MODERATOR = "moderator"
ANALYST = "analyst"

# ----------------------------------------------------------
# List all users (admin, super_admin)
# ----------------------------------------------------------
@admin_bp.route("/api/admin/users", methods=["GET"])
@require_auth
@require_role("admin", SUPER_ADMIN)
def list_users():
    try:
        users = User.query.all()
        result = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_suspended": getattr(user, "is_suspended", False)
            }
            for user in users
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------------------------------------
# List item submissions (moderator, admin, super_admin)
# ----------------------------------------------------------
@admin_bp.route("/api/admin/submissions", methods=["GET"])
@require_auth
@require_role("moderator", "admin", SUPER_ADMIN)
def list_submissions():
    try:
        items = LostItem.query.all()
        result = [
            {
                "id": item.id,
                "name": item.name,
                "description": item.description,
                "category": item.category,
                "status": getattr(item, "status", "pending"),
                "image_url": item.image_url,
                "reported_by": item.reported_by
            }
            for item in items
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------------------------------------
# Audit logs (super_admin only) - demo static logs
# ----------------------------------------------------------
@admin_bp.route("/api/admin/logs", methods=["GET"])
@require_auth
@require_role(SUPER_ADMIN)
def audit_logs():
    try:
        logs = [
            {"timestamp": "2025-11-26 10:00", "admin_user": "super_admin", "action": "Suspended user 2"},
            {"timestamp": "2025-11-26 09:45", "admin_user": "admin", "action": "Approved item 5"}
        ]
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------------
# Suspend user (super admin only)
# ----------------------------------------------------------
@admin_bp.route("/api/admin/users/<int:user_id>/suspend", methods=["PUT"])
@require_auth
@require_role(SUPER_ADMIN)
def suspend_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        user.is_suspended = True
        db.session.commit()
        return jsonify({"message": f"User {user_id} suspended successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------------
# Approve item (super_admin + moderator)
# ----------------------------------------------------------
@admin_bp.route("/api/admin/items/<int:item_id>/approve", methods=["PUT"])
@require_auth
@require_role(SUPER_ADMIN, MODERATOR)
def approve_item(item_id):
    item = LostItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404

    item.status = "approved"
    db.session.commit()

    return jsonify({"message": f"Item {item_id} approved"}), 200


# ----------------------------------------------------------
# Analytics (super_admin + analyst)
# ----------------------------------------------------------
@admin_bp.route("/api/admin/analytics", methods=["GET"])
@require_auth
@require_role(SUPER_ADMIN, ANALYST)
def get_analytics():
    data = {
        "active_users": User.query.filter_by(is_suspended=False).count(),
        "resolved_items": LostItem.query.filter_by(status="released").count(),
    }
    return jsonify(data), 200
