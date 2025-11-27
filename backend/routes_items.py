from flask import Blueprint, request, jsonify, current_app
from backend.models import db, LostItem, User
import os

# Use the FIXED decorators from utils.py
from backend.utils import require_auth, require_role, send_notification_email

items_bp = Blueprint("items", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "datasets", "images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------------------------------------------------------
# Get all items (public route)
# -------------------------------------------------------------------
@items_bp.route("/api/items", methods=["GET", "OPTIONS"])
def get_items():
    items = LostItem.query.all()
    result = [
        {
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "image_url": item.image_url,
            "recovered": item.recovered,
            "reported_by": item.reported_by
        }
        for item in items
    ]
    return jsonify(result), 200

# -------------------------------------------------------------------
# Student: Report lost item with image recognition and NLP
# -------------------------------------------------------------------
from PIL import Image
import torch
from transformers import pipeline

@items_bp.route("/api/report", methods=["POST"])
@require_auth
def report_lost_item():
    # Get form data
    description = request.form.get("description")
    name = request.form.get("name")
    image = request.files.get("image")
    user_id = getattr(request, "user", None)
    if user_id:
        user_id = user_id.get("id")

    # Save image
    image_url = None
    if image:
        image_path = os.path.join(UPLOAD_FOLDER, image.filename)
        image.save(image_path)
        image_url = f"datasets/images/{image.filename}"

    # --- Image Recognition (Demo: use HuggingFace zero-shot-image-classification) ---
    image_labels = []
    try:
        classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch16")
        pil_img = Image.open(image_path)
        candidate_labels = ["laptop", "wallet", "book", "keychain", "phone", "bag", "ID card"]
        result = classifier(pil_img, candidate_labels)
        image_labels = [r["label"] for r in result if r["score"] > 0.2]
    except Exception as e:
        print(f"Image recognition error: {e}")

    # --- NLP (Demo: keyword extraction using transformers pipeline) ---
    nlp_keywords = []
    try:
        nlp = pipeline("feature-extraction", model="distilbert-base-uncased")
        # For demo, just split description into keywords
        nlp_keywords = description.split()
    except Exception as e:
        print(f"NLP error: {e}")

    # Store in DB
    item = LostItem(
        name=name or (image_labels[0] if image_labels else "Unknown"),
        description=description,
        image_url=image_url,
        category=", ".join(image_labels),
        reported_by=user_id,
        status="lost"
    )
    db.session.add(item)
    db.session.commit()

    return jsonify({
        "message": "Report submitted",
        "item_id": item.id,
        "image_labels": image_labels,
        "nlp_keywords": nlp_keywords
    }), 201


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
    item.status = "found"
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
