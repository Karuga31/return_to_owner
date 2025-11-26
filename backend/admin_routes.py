from flask import Blueprint, request, jsonify
from backend.models import db, User, LostItem
from backend.utils import require_auth, require_role

admin_bp = Blueprint("admin", __name__)

SUPER_ADMIN = "super_admin"
MODERATOR = "moderator"
ANALYST = "analyst"


# ----------------------------------------------------------
# Suspend user (super admin only)
# ----------------------------------------------------------
@admin_bp.route("/api/admin/users/<int:user_id>/suspend", methods=["PUT"])
@require_auth
@require_role(SUPER_ADMIN)
def suspend_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_suspended = True
    db.session.commit()

    return jsonify({"message": f"User {user_id} suspended successfully"}), 200


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
