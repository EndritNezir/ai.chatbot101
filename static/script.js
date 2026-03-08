const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const resetBtn = document.getElementById("resetBtn");

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  userInput.value = "";

  appendMessage("Thinking...", "bot");
  const thinkingMessage = chatBox.lastChild;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    thinkingMessage.remove();
    appendMessage(data.reply || "No response received.", "bot");
  } catch (error) {
    thinkingMessage.remove();
    appendMessage("Something went wrong. Please try again.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

resetBtn.addEventListener("click", async () => {
  try {
    await fetch("/reset", { method: "POST" });
  } catch (error) {
    console.log("Reset failed");
  }

  chatBox.innerHTML = "";
  appendMessage(
    "Hello! I’m a demo AI chatbot for websites. Ask me about services, pricing, features, or website integration.",
    "bot"
  );
});