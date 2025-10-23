import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: String,
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.model("Message", messageSchema);
