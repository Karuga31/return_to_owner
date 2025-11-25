from flask import Blueprint, request, jsonify, current_app
from models import db, LostItem
import os
from utils import require_auth, require_role

items_bp = Blueprint("items", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "datasets", "images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Authenticated report (students/staff can report)
@items_bp.route("/api/report", methods=["POST"])
@require_auth
def report_item():
    user = request.user
    description = request.form.get("description")
    name = request.form.get("name") or (description[:40] if description else "Unnamed")
    image = request.files.get("image")

    if not description:
        return jsonify({"error": "Description required"}), 400

    filename = None
    if image:
        filename = f"{int(db.func.now().timestamp())}_{image.filename}"
        path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(path)

    item = LostItem(name=name, description=description, image_url=filename, reported_by=user.id)
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Reported", "id": item.id}), 201

# Public items listing (anyone signed in)
@items_bp.route("/api/items", methods=["GET"])
@require_auth
def get_items():
    items = LostItem.query.order_by(LostItem.id.desc()).all()
    return jsonify([
        {
            "id": it.id,
            "name": it.name,
            "description": it.description,
            "image": it.image_url,
            "reported_by": it.reported_by,
            "recovered": it.recovered
        } for it in items
    ]), 200

# Mark recovered (guards + admin)
@items_bp.route("/api/items/<int:item_id>/recover", methods=["POST"])
@require_auth
@require_role("guard", "admin")
def mark_recovered(item_id):
    item = LostItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404
    item.recovered = True
    db.session.commit()
    return jsonify({"message": "Marked recovered"}), 200
