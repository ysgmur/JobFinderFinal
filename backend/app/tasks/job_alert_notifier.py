from app.extensions import mongo
from datetime import datetime, timedelta

def job_alert_notifier():
    print("🔔 Running Job Alert Notifier...")

    # Son 1 saat içinde eklenen işler (sadece örnek)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    new_jobs = list(mongo["jobs"].find({"last_updated": {"$gte": one_hour_ago}}))

    if not new_jobs:
        print("⏳ No new jobs found.")
        return

    alerts = list(mongo.db.alerts.find({"is_active": True}))
    for alert in alerts:
        user_id = alert["user_id"]
        keyword = alert.get("keyword", "").lower()
        city = alert.get("city", "").lower()

        matched_jobs = []
        for job in new_jobs:
            if (keyword in job["title"].lower()) and (city in job["city"].lower()):
                matched_jobs.append(job)

        if matched_jobs:
            print(f"📨 Sending alert to user {user_id} for {len(matched_jobs)} jobs.")

            mongo["notifications"].insert_one({
                "user_id": user_id,
                "type": "alert",
                "timestamp": datetime.utcnow(),
                "jobs": [str(job["_id"]) for job in matched_jobs]
            })
