import express from "express";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});

const serverInstance = app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

const wss = new WebSocketServer({ server: serverInstance });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    const msg = data.toString();
    console.log(`Client says: ${msg}`);
    ws.send(`Server received: "${msg}"`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
