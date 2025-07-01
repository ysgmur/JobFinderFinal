from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from app.routes.auth_routes import auth_bp
from app.routes.job_routes import job_bp
from app.routes.search_routes import search_bp
from app.routes.notification_routes import notif_bp
from app.routes.ai_agent_routes import ai_bp
from app.routes.admin_routes import admin_bp

from dotenv import load_dotenv
import os

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = "jwt-secret"  # Güvenlik için .env'den alınabilir
    app.config["SECRET_KEY"] = "secret123"
    app.config["JWT_SECRET_KEY"] = "jwt-secret"
    app.config["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
    # Init extensions
    JWTManager(app)
    CORS(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(job_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(notif_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")

    return app
