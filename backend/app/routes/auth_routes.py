from flask import Blueprint, request, jsonify
from app.extensions import mongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import uuid

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    users = mongo["users"]

    if users.find_one({"username": data["username"]}):
        return jsonify({"msg": "Username already exists"}), 400

    user = {
        "_id": str(uuid.uuid4()),
        "username": data["username"],
        "email": data["email"],
        "password": generate_password_hash(data["password"]),
        "is_admin": False
    }
    users.insert_one(user)
    return jsonify({"msg": "User created successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = mongo["users"].find_one({"username": data["username"]})

    if user and check_password_hash(user["password"], data["password"]):
        token = create_access_token(identity=str(user["_id"]))
        return jsonify({
            "access_token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "is_admin": user.get("is_admin", False)
            }
        })

    return jsonify({"msg": "Invalid credentials"}), 401
