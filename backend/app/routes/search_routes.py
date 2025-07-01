from flask import Blueprint, request, jsonify
from app.extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime
import uuid

search_bp = Blueprint("search", __name__)

@search_bp.route("/search", methods=["POST"])
@jwt_required()
def store_search():
    data = request.get_json()
    user_id = get_jwt_identity()
    search = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "keyword": data.get("keyword"),
        "city": data.get("city"),
        "timestamp": datetime.datetime.utcnow()
    }
    mongo["searches"].insert_one(search)
    return jsonify({"msg": "Search saved"})

@search_bp.route("/search/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    searches = list(mongo["searches"].find({"user_id": user_id}).sort("timestamp", -1).limit(10))
    for s in searches:
        s["_id"] = str(s["_id"])
    return jsonify(searches)

