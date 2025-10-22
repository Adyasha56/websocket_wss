const socket = new WebSocket("wss://websocket-chat-server.onrender.com");

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("msgInput");
const button = document.getElementById("sendBtn");

// Connection opened
socket.addEventListener("open", () => {
  appendMessage("✅ Connected to server");
});

// Receiving messages from server
socket.addEventListener("message", (event) => {
  appendMessage("🖥️ Server: " + event.data);
});

// Send message only if connection is open
button.addEventListener("click", () => {
  const msg = input.value.trim();
  if (!msg) return;

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
    appendMessage(" You: " + msg);
    input.value = "";
  } else if (socket.readyState === WebSocket.CONNECTING) {
    appendMessage("Connection still opening, please wait...");
  } else {
    appendMessage(" WebSocket not connected");
  }
});

function appendMessage(message) {
  const p = document.createElement("p");
  p.textContent = message;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
