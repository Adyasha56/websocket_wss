import express from "express";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { Message } from "./models/Message.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB connection error:", err));


app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});

const serverInstance = app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

const wss = new WebSocketServer({ server: serverInstance });

//room connections
const rooms = {};

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.replace("/?", ""));
  const roomId = params.get("room");
  const sender = params.get("user");
   if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(ws);

  console.log(`${sender} joined room ${roomId}`);

  ws.on("message", async (messageData) => {
    const data = JSON.parse(messageData);

      // Save message in DB
      const msg = new Message({
        roomId,
        sender: data.sender,
        text: data.text
      });
      await msg.save();

    // Broadcast to all in same room
    rooms[roomId].forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(msg));
        }
      });
    });

  
  ws.on("close", () => {
    rooms[roomId] = rooms[roomId].filter(client => client !== ws);
  });
});

app.get("/messages/:roomId", async (req, res) => {
  const msgs = await Message.find({ roomId: req.params.roomId }).sort("timestamp");
  res.json(msgs);
});
