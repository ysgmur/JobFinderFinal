from app.extensions import mongo
from datetime import datetime, timedelta

def related_job_notifier():
    print("🔍 Running Related Job Notifier...")

    # Geçmiş 24 saatlik arama kayıtları
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    recent_searches = mongo["searches"].find({"timestamp": {"$gte": one_day_ago}})

    for search in recent_searches:
        user_id = search["user_id"]
        keyword = search.get("keyword", "").lower()
        city = search.get("city", "").lower()

        related_jobs = list(mongo["jobs"].find({
            "title": {"$regex": keyword, "$options": "i"},
            "city": {"$regex": city, "$options": "i"}
        }).limit(5))

        if related_jobs:
            print(f"📨 Notifying user {user_id} about {len(related_jobs)} related jobs.")

            mongo["notifications"].insert_one({
                "user_id": user_id,
                "type": "related",
                "timestamp": datetime.utcnow(),
                "jobs": [str(job["_id"]) for job in related_jobs]
            })
