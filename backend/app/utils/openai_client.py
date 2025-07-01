def extract_search_intent(prompt):
    from openai import OpenAI
    from flask import current_app

    try:
        client = OpenAI(api_key=current_app.config["OPENAI_API_KEY"])
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a job search assistant. "
                        "Given a user prompt, extract the 'keyword' (job title or field) and 'city'. "
                        "Respond only in the format: keyword: ..., city: ..."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        reply = response.choices[0].message.content.strip()
        print("🧠 OpenAI cevabı:", reply)

        keyword = ""
        city = ""

        for part in reply.split(","):
            if "keyword:" in part.lower():
                keyword = part.split(":")[1].strip()
            elif "city:" in part.lower():
                city = part.split(":")[1].strip()

        return keyword, city

    except Exception as e:
        print("❌ OpenAI API hatası:", e)
        return "", ""
