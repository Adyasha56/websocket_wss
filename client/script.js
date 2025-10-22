const socket = new WebSocket("ws://localhost:8080");

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("msgInput");
const button = document.getElementById("sendBtn");

socket.addEventListener("open", () => {
  appendMessage("✅ Connected to server");
});

socket.addEventListener("message", (event) => {
  appendMessage("🖥️ Server: " + event.data);
});

button.addEventListener("click", () => {
  const msg = input.value.trim();
  if (msg) {
    socket.send(msg);
    appendMessage("🙋 You: " + msg);
    input.value = "";
  }
});

function appendMessage(message) {
  const p = document.createElement("p");
  p.textContent = message;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
