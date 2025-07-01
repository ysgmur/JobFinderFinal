from flask import Blueprint, request, jsonify
from app.extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime
import uuid

job_bp = Blueprint("job", __name__)

@job_bp.route("/jobs", methods=["GET"])
def list_jobs():
    city = request.args.get("city")
    keyword = request.args.get("keyword")
    country = request.args.get("country")
    work_type = request.args.get("work_type")

    query = {}
    if keyword:
        query["title"] = {"$regex": keyword, "$options": "i"}
    if city:
        query["city"] = {"$regex": f"^{city}$", "$options": "i"}
    if country:
        query["country"] = {"$regex": f"^{country}$", "$options": "i"}
    if work_type:
        query["work_type"] = {"$regex": f"^{work_type}$", "$options": "i"}

    jobs = list(mongo["jobs"].find(query).sort("last_updated", -1).limit(20))
    for job in jobs:
        job["_id"] = str(job["_id"])

    return jsonify(jobs)

@job_bp.route("/autocomplete", methods=["GET"])
def autocomplete():
    field = request.args.get("field")
    query = request.args.get("query", "")
    if not field or field not in ["title", "city"]:
        return jsonify([])

    results = mongo["jobs"].distinct(field, {field: {"$regex": query, "$options": "i"}})
    return jsonify(results[:10])


@job_bp.route("/jobs/<job_id>", methods=["GET"])
def get_job_detail(job_id):
    job = mongo["jobs"].find_one({"_id": job_id})

    if not job:
        return jsonify({"error": "Job not found"}), 404

    job["application_count"] = mongo["applications"].count_documents({"job_id": job_id})
    job["_id"] = str(job["_id"])

    related = list(mongo["jobs"].aggregate([
        {"$match": {
            "_id": {"$ne": job_id},
            "city": job["city"]
        }},
        {"$sample": {"size": 3}}
    ]))
    for r in related:
        r["_id"] = str(r["_id"])

    return jsonify({"job": job, "related_jobs": related})


@job_bp.route("/jobs/related", methods=["GET"])
def get_related_jobs():
    title = request.args.get("title", "")
    city = request.args.get("city", "")
    related = mongo["jobs"].find({
        "title": {"$regex": title[:4], "$options": "i"},
        "city": city
    }).limit(10)

    results = []
    for job in related:
        job["_id"] = str(job["_id"])
        results.append(job)
    return jsonify(results)


@job_bp.route("/apply/<string:job_id>", methods=["POST"])
@jwt_required()
def apply_to_job(job_id):
    user_id = get_jwt_identity()

    job = mongo["jobs"].find_one({"_id": job_id})
    if not job:
        return jsonify({"error": "Job not found"}), 404

    existing_application = mongo["applications"].find_one({
        "user_id": user_id,
        "job_id": job_id
    })

    if existing_application:
        return jsonify({"message": "Already applied"}), 400

    mongo["applications"].insert_one({
        "user_id": user_id,
        "job_id": job_id,
        "applied_at": datetime.datetime.utcnow()
    })

    mongo["jobs"].update_one(
        {"_id": job_id},
        {"$inc": {"application_count": 1}}
    )

    return jsonify({"message": "Applied successfully"}), 200
