from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = "secret123"
    SQLALCHEMY_DATABASE_URI = "sqlite:///jobfinder.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "jwt-secret"
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    MONGODB_URI = os.getenv("MONGODB_URI")  # ✅ Burası eklen
