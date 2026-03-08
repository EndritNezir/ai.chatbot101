from flask import Flask, render_template, request, jsonify, session
from openai import OpenAI
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-this-secret-key")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

conversation_store = {}

SYSTEM_PROMPT = """
You are a professional AI assistant for a website that offers custom AI chatbots for websites.

Your role:
- answer clearly and professionally
- keep replies concise but helpful
- explain chatbot services, pricing, use cases, and website integration
- present the service as modern, premium, and practical
- if asked about custom pricing, explain that prices vary depending on features, business type, FAQ size, and design level
- if information is unknown, be honest
"""

@app.route("/")
def home():
    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())

    session_id = session["session_id"]

    if session_id not in conversation_store:
        conversation_store[session_id] = []

    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "Please type a message first."}), 400

    session_id = session.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
        session["session_id"] = session_id

    if session_id not in conversation_store:
        conversation_store[session_id] = []

    history = conversation_store[session_id]
    history.append({"role": "user", "content": user_message})

    trimmed_history = history[-10:]

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *trimmed_history
            ]
        )

        bot_reply = response.output_text.strip() if response.output_text else "Sorry, I could not generate a response."

        history.append({"role": "assistant", "content": bot_reply})

        return jsonify({"reply": bot_reply})

    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500


@app.route("/reset", methods=["POST"])
def reset_chat():
    session_id = session.get("session_id")
    if session_id and session_id in conversation_store:
        conversation_store[session_id] = []
    return jsonify({"status": "reset successful"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)