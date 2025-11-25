from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # e.g., "student", "staff", "guard", "admin"
    password_hash = db.Column(db.String(128), nullable=False)

class LostItem(db.Model):
    __tablename__ = 'lost_items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=False)

    category = db.Column(db.String(50), nullable=True)  # phone, bag, ID, laptop, etc.
    image_url = db.Column(db.String(200), nullable=True)

    location_found = db.Column(db.String(150), nullable=True)
    date_reported = db.Column(db.DateTime, default=db.func.current_timestamp())

    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    recovered = db.Column(db.Boolean, default=False)

    recovered_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    recovered_date = db.Column(db.DateTime, nullable=True)

    guard_verified = db.Column(db.Boolean, default=False)

