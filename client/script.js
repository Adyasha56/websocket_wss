// client/script.js
const sender = prompt("Enter your name:");
const room = prompt("Enter room name to join:");

const socket = new WebSocket(`ws://websocket-wss-pfzh.onrender.com/?room=${room}`); //

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("msgInput");
const button = document.getElementById("sendBtn");

// Load previous messages
fetch(`https://websocket-wss-pfzh.onrender.com/messages/${room}`)
  .then(res => res.json())
  .then(data => {
    data.forEach(m => appendMessage(`${m.sender}: ${m.text}`));
  });

socket.addEventListener("open", () => {
  appendMessage("✅ Connected to server");
});

socket.addEventListener("message", (event) => {
  const { sender, message } = JSON.parse(event.data);
  appendMessage(`${sender}: ${message}`);
});

button.addEventListener("click", () => {
  const message = input.value.trim();
  if (!message) return;
  socket.send(JSON.stringify({ sender, message }));
  input.value = "";
});

function appendMessage(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
