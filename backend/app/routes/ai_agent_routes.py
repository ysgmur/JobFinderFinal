from flask import Blueprint, request, jsonify
from app.extensions import mongo
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
load_dotenv()

ai_bp = Blueprint("ai", __name__)

# ✅ Yeni OpenAI client nesnesi (v1+ için)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@ai_bp.route("/ai/search", methods=["POST"])
def ai_search_and_return_jobs():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "").strip()

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # 🎯 Sistem promptu: JSON cevabı bekleniyor
        system_prompt = """
You are an assistant that extracts intent and details from job-related prompts.
Respond ONLY in raw JSON. No explanation. No formatting.

If the user is searching for a job:
{"intent": "search", "keyword": "web developer", "city": "Istanbul"}

If the user wants to apply:
{"intent": "apply", "job_id": "abc123"}
"""

        # ✅ Yeni client ile OpenAI çağrısı
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)

        # 🔍 Arama intent'iyse MongoDB sorgusu yap
        if parsed.get("intent") == "search":
            keyword = parsed.get("keyword", "")
            city = parsed.get("city", "")

            query = {}
            if keyword:
                query["title"] = {"$regex": keyword, "$options": "i"}
            if city:
                query["city"] = {"$regex": city, "$options": "i"}

            jobs = list(mongo.db.jobs.find(query).sort("last_updated", -1).limit(5))
            for job in jobs:
                job["_id"] = str(job["_id"])

            return jsonify(jobs)

        elif parsed.get("intent") == "apply":
            return jsonify(parsed)

        else:
            return jsonify({"intent": "unknown"})

    except Exception as e:
        print("❌ AI parsing error:", e)
        return jsonify({"error": "AI agent failed"}), 500
