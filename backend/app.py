from flask import Flask
from flask_cors import CORS
from models import db, User, LostItem

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lostfound.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'replace-this-with-a-secure-random-string'

    db.init_app(app)
    CORS(app)

    # import and register blueprints
    from routes_auth import auth_bp
    from routes_items import items_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(items_bp)

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
