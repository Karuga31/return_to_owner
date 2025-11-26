# Script to hash all plain text passwords in the users table
from backend.models import db, User
from werkzeug.security import generate_password_hash
from backend.app import app

with app.app_context():
    users = User.query.all()
    for user in users:
        # If the password is not hashed (length < 30, not starting with pbkdf2:sha256:), hash it
        if not user.password_hash.startswith('pbkdf2:sha256:'):
            print(f"Hashing password for user: {user.username}")
            user.password_hash = generate_password_hash(user.password_hash)
    db.session.commit()
    print("All user passwords have been hashed.")
