from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_session import Session
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from config import Config
from app.models import db
from routes.auth_routes import auth_bp
from routes.project_routes import project_bp
from routes.file_routes import file_bp
from routes.ml import ml_routes
from routes.dl import dl_routes
app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app, supports_credentials=True)
Session(app)
jwt = JWTManager(app)
login_manager = LoginManager()
login_manager.init_app(app)

# Enregistrement des blueprints (routes)
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(project_bp, url_prefix='/projects')
app.register_blueprint(file_bp, url_prefix='/file')
app.register_blueprint(ml_routes,url_prefix='/ml_routes')
app.register_blueprint(dl_routes,url_prefix='/dl_routes')
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
