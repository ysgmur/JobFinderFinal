# 📁 routes/notif_routes.py
from flask import Blueprint, request, jsonify
from app.extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

notif_bp = Blueprint("notif", __name__)
@notif_bp.route("/alerts", methods=["POST"])
@jwt_required()
def create_alert():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        print("📥 ALERT DATA:", data)              # gelen frontend verisi
        print("👤 USER_ID from JWT:", user_id)     # JWT'den alınan kullanıcı ID'si

        alert = {
            "user_id": user_id,
            "keyword": data.get("keyword"),
            "city": data.get("city"),
            "is_active": True
        }

        result = mongo.db.alerts.insert_one(alert)
        print("✅ INSERTED ID:", result.inserted_id)  # MongoDB kayıt sonucu

        return jsonify({"msg": "Alert created", "alert_id": str(result.inserted_id)}), 201

    except Exception as e:
        print("❌ Alert creation error:", e)  # Hatanın tam mesajı buraya düşer
        return jsonify({"msg": "Failed to create alert"}), 500


@notif_bp.route("/alerts", methods=["GET"])
@jwt_required()
def get_alerts():
    user_id = get_jwt_identity()
    try:
        alerts_cursor = mongo.db.alerts.find({"user_id": user_id})
        alerts = []
        for alert in alerts_cursor:
            alert["_id"] = str(alert["_id"])
            alerts.append(alert)
        return jsonify(alerts)
    except Exception as e:
        print("Fetch alerts error:", e)
        return jsonify({"msg": "Failed to fetch alerts"}), 500

@notif_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_user_notifications():
    user_id = get_jwt_identity()
    notifs = list(mongo["notifications"].find({"user_id": user_id}).sort("timestamp", -1))
    for n in notifs:
        n["_id"] = str(n["_id"])
    return jsonify(notifs)
