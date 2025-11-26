from flask import Blueprint, request, jsonify, current_app
from backend.models import db, LostItem, User
import os

# Use the FIXED decorators from utils.py
from backend.utils import require_auth, require_role, send_notification_email

items_bp = Blueprint("items", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "datasets", "images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -------------------------------------------------------------------
# Mark recovered (user + admin)
# -------------------------------------------------------------------
@items_bp.route("/api/items/<int:item_id>/recover", methods=["POST"])
@require_auth
@require_role("user", "admin")
def mark_recovered(item_id):
    item = LostItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404

    item.recovered = True
    db.session.commit()
    return jsonify({"message": "Marked recovered"}), 200


# -------------------------------------------------------------------
# Admin: Update item status + send email
# -------------------------------------------------------------------
@items_bp.route("/api/items/<int:item_id>/status", methods=["PUT"])
@require_auth
@require_role("super_admin", "moderator")
def update_item_status(item_id):
    data = request.get_json()
    new_status = data.get("status")

    item = LostItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    if new_status not in ["approved", "pending", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    # Update DB status
    item.status = new_status
    db.session.commit()

    # Find reporter email
    reporter = User.query.get(item.reported_by)
    if reporter and reporter.email:
        send_notification_email(reporter.email, item.name, new_status)

    return jsonify({"message": f"Item status updated to {new_status}"}), 200
