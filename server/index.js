// server/index.js
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Message } from "./models/Message.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

// Room connections: { roomId: [ws1, ws2] }
const rooms = {};

// WebSocket connection
wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/?", ""));
  const roomId = params.get("room");
  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(ws);

  console.log(`Client joined room ${roomId}`);

  // Listen for messages
  ws.on("message", async (messageData) => {
    try {
      const data = JSON.parse(messageData); // { sender, message }

      // Save to MongoDB
      const msg = await Message.create({
        roomId,
        sender: data.sender,
        text: data.message
      });

      // Broadcast to all clients in the same room
      rooms[roomId].forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ sender: msg.sender, message: msg.text }));
        }
      });

    } catch (err) {
      console.error("Error saving/broadcasting message:", err);
    }
  });

  ws.on("close", () => {
    rooms[roomId] = rooms[roomId].filter(client => client !== ws);
    console.log(`Client left room ${roomId}`);
  });
});

// Load previous messages
app.get("/messages/:roomId", async (req, res) => {
  const msgs = await Message.find({ roomId: req.params.roomId }).sort("timestamp");
  res.json(msgs);
});

// Simple health check
app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
