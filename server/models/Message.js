// server/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Index for faster room queries
messageSchema.index({ roomId: 1, timestamp: 1 });

export const Message = mongoose.model("Message", messageSchema);
