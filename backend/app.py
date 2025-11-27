import os
import pandas as pd
from flask import Flask, app
from flask_cors import CORS
from backend.models import db
from flask_migrate import Migrate
from backend.routes_auth import auth_bp
from backend.routes_items import items_bp
from backend.admin_routes import admin_bp

# =====================================================
#   CSV DATASET HANDLING
# =====================================================

DATASET_PATH = "datasets/lost_items_dataset.csv"

# Ensure datasets folder exists
os.makedirs("datasets", exist_ok=True)

# Create file if missing or empty
if not os.path.exists(DATASET_PATH) or os.path.getsize(DATASET_PATH) == 0:
    sample_data = {
        "Item Name": ["Lost Laptop", "Missing Wallet", "Found Book", "Lost Keychain"],
        "Category": ["Electronics", "Accessories", "Books", "Accessories"],
        "Color": ["Black", "Brown", "Red", "Silver"],
        "Date Found": ["2025-11-25", "2025-11-24", "2025-11-23", "2025-11-22"],
        "Location Found": ["Library", "Cafeteria", "Lecture Hall", "Security Desk"],
        "Condition": ["New", "Used", "Used", "Good"],
    }

    df = pd.DataFrame(sample_data)
    df.to_csv(DATASET_PATH, index=False)
    print("Created default dataset file:", DATASET_PATH)

# Try loading dataset
try:
    df = pd.read_csv(DATASET_PATH)
    print("Dataset loaded:")
    print(df.head())
except Exception as e:
    print("ERROR loading CSV:", e)

# =====================================================
#   FLASK APPLICATION FACTORY
# =====================================================

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('DATABASE_URL', 'mysql://root:@localhost/return_to_owner')
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False # This is good
    app.config["SECRET_KEY"] = "replace-this-with-a-secure-random-string"
    # Email config (optional)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USERNAME'] = ""     # YOUR EMAIL
    app.config['MAIL_PASSWORD'] = ""     # YOUR APP PASSWORD

    db.init_app(app)
    migrate = Migrate(app, db)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(items_bp)
    app.register_blueprint(admin_bp)

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
