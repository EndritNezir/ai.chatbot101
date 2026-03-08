from flask import Flask, render_template, request, jsonify, session
from openai import OpenAI
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

app = Flask(__name__)
app.secret_key = "super-secret-key-change-this-later"

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Temporary in-memory chat history
# For production, use a database like PostgreSQL or Redis
conversation_store = {}

SYSTEM_PROMPT = """
You are a professional AI chatbot for a website portfolio demo.

Your role:
- answer like a smart, modern website assistant
- be helpful, clear, and confident
- keep answers concise unless the user asks for more detail
- explain chatbot features, pricing, website integration, services, and support
- present the chatbot as professional, premium, and useful for businesses
- if asked about pricing, mention that there is a free demo version and custom versions can be tailored for websites
- if something is unknown, be honest and say so
"""

@app.route("/")
def home():
    # Create a session id if it does not exist
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

    # Save user message to memory
    history.append({"role": "user", "content": user_message})

    # Keep only the most recent messages to avoid overly large context
    trimmed_history = history[-10:]

    try:
        response = client.responses.create(
            model="gpt-5.4",
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *trimmed_history
            ]
        )

        bot_reply = response.output_text

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
    app.run(debug=True)