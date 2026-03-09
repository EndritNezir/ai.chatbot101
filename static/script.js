const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const resetBtn = document.getElementById("resetBtn");

const floatingChatBtn = document.getElementById("floatingChatBtn");
const floatingChatPanel = document.getElementById("floatingChatPanel");
const closeFloatingChat = document.getElementById("closeFloatingChat");
const openChatFromHero = document.getElementById("openChatFromHero");
const openChatFromPricing = document.getElementById("openChatFromPricing");

function openChatPanel() {
  floatingChatPanel.classList.add("open");
  setTimeout(() => {
    if (userInput) userInput.focus();
  }, 120);
}

function closeChatPanel() {
  floatingChatPanel.classList.remove("open");
}

if (floatingChatBtn) {
  floatingChatBtn.addEventListener("click", openChatPanel);
}

if (closeFloatingChat) {
  closeFloatingChat.addEventListener("click", closeChatPanel);
}

if (openChatFromHero) {
  openChatFromHero.addEventListener("click", openChatPanel);
}

if (openChatFromPricing) {
  openChatFromPricing.addEventListener("click", openChatPanel);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeChatPanel();
  }
});

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

if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

if (userInput) {
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    try {
      await fetch("/reset", { method: "POST" });
    } catch (error) {
      console.log("Reset failed");
    }

    chatBox.innerHTML = "";
    appendMessage(
      "Hello. I’m a demo website chatbot. Ask me about services, pricing, features, or website integration.",
      "bot"
    );
  });
}

const websiteType = document.getElementById("websiteType");
const pagesCount = document.getElementById("pagesCount");
const faqCount = document.getElementById("faqCount");
const designLevel = document.getElementById("designLevel");
const projectNotes = document.getElementById("projectNotes");
const addonCheckboxes = document.querySelectorAll(".quote-addon");

const estimatedPrice = document.getElementById("estimatedPrice");
const recommendedPackage = document.getElementById("recommendedPackage");
const quoteSummary = document.getElementById("quoteSummary");
const calculateQuoteBtn = document.getElementById("calculateQuoteBtn");
const sendQuoteBtn = document.getElementById("sendQuoteBtn");

function getSelectedAddons() {
  const selected = [];
  addonCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selected.push({
        label: checkbox.dataset.label,
        value: Number(checkbox.value)
      });
    }
  });
  return selected;
}

function calculateQuote() {
  if (!websiteType || !pagesCount || !faqCount || !designLevel) return null;

  const basePrice = 60;

  const total =
    basePrice +
    Number(websiteType.value) +
    Number(pagesCount.value) +
    Number(faqCount.value) +
    Number(designLevel.value) +
    getSelectedAddons().reduce((sum, addon) => sum + addon.value, 0);

  let packageName = "Starter";
  let summaryText = "Good for a simple website chatbot with clean design and essential setup.";

  if (total >= 100 && total < 160) {
    packageName = "Business";
    summaryText = "Best for a polished small-business chatbot with improved styling and more practical features.";
  } else if (total >= 160) {
    packageName = "Advanced";
    summaryText = "Best for a more customised chatbot setup with richer functionality, more content, and a stronger workflow.";
  }

  if (estimatedPrice) estimatedPrice.textContent = `€${total}`;
  if (recommendedPackage) recommendedPackage.textContent = packageName;
  if (quoteSummary) quoteSummary.textContent = summaryText;

  return {
    total,
    packageName,
    summaryText,
    addons: getSelectedAddons()
  };
}

if (calculateQuoteBtn) {
  calculateQuoteBtn.addEventListener("click", calculateQuote);
}

[websiteType, pagesCount, faqCount, designLevel].forEach((field) => {
  if (field) field.addEventListener("change", calculateQuote);
});

addonCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", calculateQuote);
});

if (sendQuoteBtn) {
  sendQuoteBtn.addEventListener("click", () => {
    const quote = calculateQuote();
    if (!quote) return;

    const addonText = quote.addons.length
      ? quote.addons.map((addon) => `- ${addon.label}`).join("\n")
      : "- No extra add-ons selected";

    const notesText = projectNotes && projectNotes.value.trim()
      ? projectNotes.value.trim()
      : "No extra notes provided.";

    const subject = encodeURIComponent("Custom AI Chatbot Request");
    const body = encodeURIComponent(
`Hello Endrit,

I would like to request a custom AI chatbot for my website.

Estimated package: ${quote.packageName}
Estimated price: €${quote.total}

Selected requirements:
- Website type: ${websiteType.options[websiteType.selectedIndex].text}
- Website size: ${pagesCount.options[pagesCount.selectedIndex].text}
- FAQ size: ${faqCount.options[faqCount.selectedIndex].text}
- Design level: ${designLevel.options[designLevel.selectedIndex].text}

Add-ons:
${addonText}

Project notes:
${notesText}

Please contact me with the next steps.
`
    );

    window.location.href = `mailto:info@endritai.live?subject=${subject}&body=${body}`;
  });
}

calculateQuote();
