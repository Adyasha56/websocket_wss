import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Message } from "./models/Message.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "https://websocket-wss-eta.vercel.app",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const rooms = {};
const sessionStore = {}; //Store active sessions

//Generate or get existing session for a room
function getOrCreateSession(roomId) {
  const now = Date.now();
  const SESSION_TIMEOUT = 5 * 60 * 1000; //5 minutes
  
  // Check if active session exists
  if (sessionStore[roomId]) {
    const session = sessionStore[roomId];
    
    // If last activity within 5 minutes, use same session
    if (now - session.lastActivity < SESSION_TIMEOUT) {
      session.lastActivity = now;
      session.userCount++;
      console.log(`♻️ Using existing session for room ${roomId}: ${session.sessionId}`);
      return session.sessionId;
    } else {
      console.log(`Session expired for room ${roomId}, creating new one`);
    }
  }
  
  // Create new session
  const newSessionId = `session_${roomId}_${now}`;
  sessionStore[roomId] = {
    sessionId: newSessionId,
    lastActivity: now,
    userCount: 1
  };
  
  console.log(`New session created for room ${roomId}: ${newSessionId}`);
  return newSessionId;
}

// WebSocket connection
wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/?", ""));
  const roomId = params.get("room");
  const sender = params.get("user");

  if (!roomId || !sender) {
    console.log("Invalid connection — missing room or user");
    ws.close();
    return;
  }

  //Get or create session for this room
  const sessionId = getOrCreateSession(roomId);

  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push({ ws, sessionId, sender });

  console.log(`${sender} joined room ${roomId} (session: ${sessionId})`);

  //Send session ID to client
  ws.send(JSON.stringify({
    type: "session",
    sessionId: sessionId
  }));

  //Broadcast "user joined" to same session
  rooms[roomId].forEach((client) => {
    if (client.sessionId === sessionId && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(JSON.stringify({
        type: "notification",
        message: `${sender} joined the room`
      }));
    }
  });

  ws.on("message", async (messageData) => {
    try {
      const data = JSON.parse(messageData);
      if (!data.sender || !data.message) {
        console.warn("Invalid message data:", data);
        return;
      }

      //Update last activity
      if (sessionStore[roomId]) {
        sessionStore[roomId].lastActivity = Date.now();
      }

      // Save message with sessionId
      const msg = await Message.create({
        roomId,
        sessionId,
        sender: data.sender,
        text: data.message,
      });

      // Broadcast message to same session only
      rooms[roomId].forEach((client) => {
        if (client.sessionId === sessionId && client.ws.readyState === client.ws.OPEN) {
          client.ws.send(JSON.stringify({
            type: "message",
            sender: msg.sender,
            message: msg.text
          }));
        }
      });
    } catch (err) {
      console.error("Error saving/broadcasting message:", err);
    }
  });

  ws.on("close", () => {
    if (rooms[roomId]) {
      //Broadcast "user left" before removing
      rooms[roomId].forEach((client) => {
        if (client.sessionId === sessionId && client.ws !== ws && client.ws.readyState === client.ws.OPEN) {
          client.ws.send(JSON.stringify({
            type: "notification",
            message: `${sender} left the room`
          }));
        }
      });

      rooms[roomId] = rooms[roomId].filter((client) => client.ws !== ws);

      //Decrease user count
      if (sessionStore[roomId]) {
        sessionStore[roomId].userCount--;

        // Update last activity when user leaves
        sessionStore[roomId].lastActivity = Date.now();

        if (sessionStore[roomId].userCount === 0) {
          console.log(`📭 Room ${roomId} is now empty (session will expire in 5 min)`);
        }
      }
    }
    console.log(`${sender} left room ${roomId}`);
  });
});

// Fetch messages for specific session only
app.get("/messages/:roomId/:sessionId", async (req, res) => {
  try {
    const { roomId, sessionId } = req.params;
    const msgs = await Message.find({ roomId, sessionId }).sort("timestamp");
    res.json(msgs);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// Delete session messages
app.delete("/messages/:roomId/:sessionId", async (req, res) => {
  try {
    const { roomId, sessionId } = req.params;
    const result = await Message.deleteMany({ roomId, sessionId });
    console.log(`Deleted ${result.deletedCount} messages from room ${roomId} session ${sessionId}`);
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Error deleting messages:", err);
    res.status(500).json({ error: "Error deleting messages" });
  }
});

app.get("/", (req, res) => {
  res.send("WebSocket server is running ");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});