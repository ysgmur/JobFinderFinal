from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import mongo
import uuid
import datetime

admin_bp = Blueprint("admin", __name__)

def is_user_admin(user_id):
    user = mongo["users"].find_one({"_id": user_id})
    return user and user.get("is_admin", False)

# ✔️ Yeni ilan ekle (sadece admin)
@admin_bp.route("/admin/jobs", methods=["POST"])
@jwt_required()
def admin_create_job():
    data = request.get_json()
    print("Gelen veri:", data)  # ❗ Bu satırı geçici olarak ekle

    user_id = get_jwt_identity()
    if not is_user_admin(user_id):
        return jsonify({"msg": "Yetkisiz"}), 403

    data = request.get_json()

    job = {
        "_id": str(uuid.uuid4()),
        "title": data.get("title", ""),
        "company": data.get("company", ""),
        "description": data.get("description", ""),
        "city": data.get("city", ""),
        "district": data.get("district", ""),  # ✔️ İlçe opsiyonel
        "country": data.get("country", ""),
        "work_type": data.get("work_type", ""),
        "email": data.get("email", ""),  # ✔️ Opsiyonel email alanı
        "last_updated": datetime.datetime.utcnow(),
        "application_count": 0
    }

    mongo["jobs"].insert_one(job)
    return jsonify({"msg": "İlan başarıyla eklendi", "job_id": job["_id"]})

# ✔️ Mevcut ilanı güncelle (sadece admin)
@admin_bp.route("/admin/jobs/<job_id>", methods=["PUT"])
@jwt_required()
def admin_update_job(job_id):
    user_id = get_jwt_identity()
    if not is_user_admin(user_id):
        return jsonify({"msg": "Yetkisiz"}), 403

    data = request.get_json()
    update_fields = {k: v for k, v in data.items() if k in ["title", "company", "description", "city", "country", "work_type"]}
    update_fields["last_updated"] = datetime.datetime.utcnow()

    result = mongo["jobs"].update_one({"_id": job_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"msg": "İlan bulunamadı"}), 404

    return jsonify({"msg": "İlan güncellendi", "job_id": job_id})
