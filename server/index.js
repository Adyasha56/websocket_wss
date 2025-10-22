import express from "express";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Serve client folder
app.use(express.static(path.resolve('../client')));

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
    console.log("Client disconnected ");
  });
});
