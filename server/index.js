import dotenv from "dotenv";
import express from "express";
import {WebSocketServer} from "ws";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

const serverInstance = app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
});

const wss = new WebSocketServer({ server: serverInstance });


wss.on("connection", (ws) => {
    ws.on("message", (data) => {
        console.log(`Received message: ${data}`);
        ws.send("MIL GAYA BROOOO");
    })
    console.log("client connected"); 
});