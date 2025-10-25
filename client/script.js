const BACKEND_URL = "https://websocket-wss-pfzh.onrender.com";
// const BACKEND_URL = "http://localhost:8080";
let socket = null;
let currentRoom = null;
let currentSender = null;
let currentSessionId = null;

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const leaveBtn = document.getElementById("leaveBtn");
const roomInfo = document.getElementById("roomInfo");
const currentRoomName = document.getElementById("currentRoomName");
const currentUserName = document.getElementById("currentUserName");

// Initialize connection
function initializeChat() {
  const sender = prompt("Enter your name:");
  const room = prompt("Enter room name to join:");

  if (!sender || !room) {
    alert("Name and room are required!");
    location.reload();
    return;
  }

  // Close previous connection if exists
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }

  currentSender = sender;
  currentRoom = room;

  // Update UI
  currentRoomName.textContent = room;
  currentUserName.textContent = sender;
  roomInfo.style.display = "block";

  // Clear previous messages
  messagesDiv.innerHTML = "";
  appendMessage("Connecting to room...", "notification");

  // Create WebSocket (server will send session ID)
  socket = new WebSocket(
    `${BACKEND_URL.replace("http", "ws")}/?room=${room}&user=${sender}`
  );

  socket.addEventListener("open", () => {
    console.log("WebSocket connected");
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "session") {
      // Receive session ID from server
      currentSessionId = data.sessionId;
      console.log("Session ID received:", currentSessionId);

      // Now load messages for this session
      loadMessages();

    } else if (data.type === "notification") {
      // Join/Leave notifications
      appendMessage(data.message, "notification");

    } else if (data.type === "message") {
      // Regular chat messages
      appendMessage(`${data.sender}: ${data.message}`, "message");
    }
  });

  socket.addEventListener("close", () => {
    appendMessage("Disconnected from server", "notification");
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
    appendMessage("Connection error", "notification");
  });
}

// Load previous messages for current session
function loadMessages() {
  if (!currentSessionId) {
    console.log("⚠️ No session ID yet");
    return;
  }

  fetch(`${BACKEND_URL}/messages/${currentRoom}/${currentSessionId}`)
    .then(res => res.json())
    .then(data => {
      // Clear "Connecting..." message
      messagesDiv.innerHTML = "";

      if (data.length > 0) {
        console.log(`Loaded ${data.length} previous messages`);
        data.forEach(m => appendMessage(`${m.sender}: ${m.text}`, "message"));
      } else {
        console.log("No previous messages in this session");
        appendMessage("New session - Start chatting!", "notification");
      }
    })
    .catch(err => {
      console.error("Error loading messages:", err);
      messagesDiv.innerHTML = "";
      appendMessage("Could not load messages", "notification");
    });
}

// Send message
function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert("Not connected to server!");
    return;
  }

  socket.send(JSON.stringify({ sender: currentSender, message }));
  input.value = "";
}

// Leave room
function leaveRoom() {
  const confirmLeave = confirm("Leave room?");
  if (!confirmLeave) return;

  // Close connection (this will trigger "user left" on backend)
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }

  // Reset
  socket = null;
  currentRoom = null;
  currentSender = null;
  currentSessionId = null;

  // Clear UI
  messagesDiv.innerHTML = "";
  roomInfo.style.display = "none";
  input.value = "";

  appendMessage("You left the room. Refreshing...", "notification");

  setTimeout(() => {
    location.reload();
  }, 1500);
}

// Append message with type styling
function appendMessage(msg, type = "message") {
  const p = document.createElement("p");
  p.textContent = msg;

  // Add class based on type
  if (type === "notification") {
    p.classList.add("notification");
  }

  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);
leaveBtn.addEventListener("click", leaveRoom);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Start chat
initializeChat();