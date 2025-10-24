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
      "https://websocket-wss-eta.vercel.app", // frontend (Vercel)
      "http://localhost:5173",                // local testing
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const rooms = {};

// WebSocket connection
wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/?", ""));
  const roomId = params.get("room");
  const sender = params.get("user");

  if (!roomId || !sender) {
    console.log("⚠️ Invalid connection — missing room or user");
    ws.close();
    return;
  }

  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(ws);

  console.log(`${sender} joined room ${roomId}`);

  ws.on("message", async (messageData) => {
    try {
      const data = JSON.parse(messageData);
      if (!data.sender || !data.message) {
        console.warn("⚠️ Invalid message data:", data);
        return;
      }

      // Save message to MongoDB
      const msg = await Message.create({
        roomId,
        sender: data.sender,
        text: data.message,
      });

      // Broadcast message to same room
      rooms[roomId].forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ sender: msg.sender, message: msg.text }));
        }
      });
    } catch (err) {
      console.error("Error saving/broadcasting message:", err);
    }
  });

  ws.on("close", () => {
    if (rooms[roomId])
      rooms[roomId] = rooms[roomId].filter((client) => client !== ws);
    console.log(`${sender} left room ${roomId}`);
  });
});

// Fetch previous messages
app.get("/messages/:roomId", async (req, res) => {
  try {
    const msgs = await Message.find({ roomId: req.params.roomId }).sort("timestamp");

    // Uncomment if you want to clear old chats for fresh sessions
    // await Message.deleteMany({ roomId: req.params.roomId });

    res.json(msgs);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.get("/", (req, res) => {
  res.send("WebSocket server is running 🚀");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
