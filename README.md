---

# 🚀 **Lets Talk - Real-Time Private Chat Application**

A modern, session-based real-time chat application built with WebSockets, featuring automatic session expiry and private room conversations.
---

## 📋 **Table of Contents**

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Workflow Diagram](#-workflow-diagram)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

---

## ✨ **Features**

- 🔐 **Private Session-Based Rooms** - Each conversation creates a unique session
- ⏰ **Auto Session Expiry** - Sessions expire after 5 minutes of inactivity
- 💬 **Real-Time Messaging** - Instant message delivery using WebSockets
- 👥 **Join/Leave Notifications** - See when users enter or exit rooms
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🗄️ **Persistent Storage** - Messages saved to MongoDB
- 🔒 **Session Isolation** - Old messages don't appear in new sessions
- 🎨 **Dark Mode UI** - Modern, eye-friendly interface

---

## 🛠️ **Tech Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time bidirectional communication
- **MongoDB** - Database for message persistence
- **Mongoose** - MongoDB object modeling
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **HTML5** - Markup
- **CSS3** - Styling with modern features
- **Vanilla JavaScript** - WebSocket client implementation
- **WebSocket API** - Browser native WebSocket support

### **Deployment**
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Cloud database

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser 1  │  │   Browser 2  │  │   Browser N  │      │
│  │  (User A)    │  │  (User B)    │  │  (User N)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                     WebSocket (WSS)                          │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                     SERVER LAYER                             │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Express + WebSocket Server                  │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │      Session Manager                        │    │   │
│  │  │  - Create/Retrieve Sessions                 │    │   │
│  │  │  - 5 Min Timeout Logic                      │    │   │
│  │  │  - Session Isolation                        │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │      Room Manager                           │    │   │
│  │  │  - User Join/Leave Tracking                 │    │   │
│  │  │  - Message Broadcasting                     │    │   │
│  │  │  - Notification System                      │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    DATABASE LAYER                            │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas                           │   │
│  │                                                       │   │
│  │  Collection: messages                                │   │
│  │  ┌────────────────────────────────────────────┐     │   │
│  │  │ Document Schema:                           │     │   │
│  │  │  - roomId: String                          │     │   │
│  │  │  - sessionId: String (unique per session)  │     │   │
│  │  │  - sender: String                          │     │   │
│  │  │  - text: String                            │     │   │
│  │  │  - timestamp: Date                         │     │   │
│  │  └────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### **4. Complete System Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                     LETS TALK SYSTEM FLOW                       │
└─────────────────────────────────────────────────────────────────┘

    TIME: 10:00 AM                    TIME: 10:06 AM
    ┌──────────────┐                  ┌──────────────┐
    │   Alice      │                  │    Mary      │
    │   enters     │                  │   enters     │
    │   Room #1    │                  │   Room #1    │
    └──────┬───────┘                  └──────┬───────┘
           │                                  │
           ▼                                  │
    ┌─────────────────┐                      │
    │ Backend creates │                      │
    │ session_1_1000  │                      │
    └────────┬────────┘                      │
             │                                │
             ▼                                │
    ┌──────────────┐                         │
    │   Bob joins  │                         │
    │   Room #1    │                         │
    └──────┬───────┘                         │
           │                                  │
           ▼                                  │
    ┌─────────────────┐                      │
    │ Backend returns │                      │
    │ session_1_1000  │ ← Same Session!      │
    └────────┬────────┘                      │
             │                                │
             ▼                                │
    ┌─────────────────────┐                  │
    │ Alice & Bob chat:   │                  │
    │ "Hi", "Hello",      │                  │
    │ "How are you?"      │                  │
    └──────────┬──────────┘                  │
               │                              │
               ▼                              │
    ┌─────────────────────┐                  │
    │ Both users leave    │                  │
    └──────────┬──────────┘                  │
               │                              │
               │  ⏰ 5 MINUTES PASS           │
               │                              │
               └──────────────────────────────┤
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │ Backend creates │
                                    │ session_1_1006  │ ← NEW!
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌──────────────┐
                                    │  John joins  │
                                    │  Room #1     │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌─────────────────┐
                                    │ Backend returns │
                                    │ session_1_1006  │ ← Same as Mary
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌──────────────────────┐
                                    │ Mary & John see:     │
                                    │ "New session"        │
                                    │ NO old messages! ✅  │
                                    └──────────────────────┘
```

---

## 📦 **Installation**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### **Clone Repository**

```bash
# Clone the repo
git clone https://github.com/yourusername/lets-talk-chat.git
cd lets-talk-chat
```

### **Backend Setup**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
touch .env
```

### **Frontend Setup**

```bash
# Navigate to client directory
cd ../client

# No build required - static files
# Just open index.html in browser or use Live Server
```

---

## 🔐 **Environment Variables**

Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/letstalk?retryWrites=true&w=majority

# Server Configuration
PORT=8080

# Session Configuration (optional - defaults in code)
SESSION_TIMEOUT=300000  # 5 minutes in milliseconds
```


---

## 🚀 **Usage**

### **Local Development**

**Start Backend:**
```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

**Start Frontend:**
```bash
cd client
# Open index.html with Live Server (VS Code extension)
# or simply open index.html in browser
```

### **Access Application**

1. Open `http://127.0.0.1:5500` (or your Live Server URL)
2. Enter your name
3. Enter room name
4. Start chatting!

### **Testing Session Expiry**

```javascript
// In server.js, temporarily change timeout for testing:
const SESSION_TIMEOUT = 30 * 1000; // 30 seconds

// Test steps:
// 1. User A & B join, chat
// 2. Both leave
// 3. Wait 30 seconds
// 4. User C & D join - should see empty chat ✅
```

---

## 🌐 **Deployment**

### **Backend Deployment (Render)**

1. Create account on [Render](https://render.com)
2. New Web Service → Connect GitHub repo
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. Add Environment Variables (MONGO_URI)
5. Deploy!

### **Frontend Deployment (Vercel)**

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repo
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `client`
4. Update `script.js`:
   ```javascript
   const BACKEND_URL = "https://your-backend.onrender.com";
   ```
5. Deploy!

---

## 📡 **API Documentation**

### **WebSocket Events**

#### **Client → Server**

**Connect:**
```javascript
ws://localhost:8080/?room=roomName&user=userName
```

**Send Message:**
```json
{
  "sender": "userName",
  "message": "Hello World"
}
```

#### **Server → Client**

**Session Assignment:**
```json
{
  "type": "session",
  "sessionId": "session_room1_1234567890"
}
```

**Notification:**
```json
{
  "type": "notification",
  "message": "Alice joined the room"
}
```

**Message:**
```json
{
  "type": "message",
  "sender": "Alice",
  "message": "Hello!"
}
```

### **REST Endpoints**

#### **Get Messages**
```http
GET /messages/:roomId/:sessionId
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "roomId": "room1",
    "sessionId": "session_room1_1234567890",
    "sender": "Alice",
    "text": "Hello",
    "timestamp": "2025-10-25T10:00:00.000Z"
  }
]
```

---

## 🎨 **Features In Detail**

### **Session Management**

- **Automatic Creation:** New session created when first user joins a room
- **Session Reuse:** Users joining within 5 minutes use the same session
- **Auto Expiry:** Sessions expire 5 minutes after last activity
- **Isolation:** Each session's messages are completely separate

### **Real-Time Features**

- ✅ Instant message delivery
- ✅ Join/Leave notifications
- ✅ Connection status indicators
- ✅ Auto-reconnection on network issues

### **User Experience**

- 🎨 Modern dark theme
- 📱 Fully responsive design
- 🔔 Clear visual notifications

---

## 🐛 **Troubleshooting**

### **Common Issues**

**1. MongoDB Connection Failed**
```
Solution: Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
```

**2. WebSocket Connection Error**
```
Solution: Ensure backend is running and CORS is configured
```

**3. Messages Not Appearing**
```
Solution: Check browser console for errors, verify session ID
```

**4. CORS Error**
```
Solution: Add frontend URL to CORS origins in server.js
```

---

## 📊 **Project Structure**

```
lets-talk-chat/
├── server/
│   ├── models/
│   │   └── Message.js          # MongoDB schema
│   ├── node_modules/
│   ├── .env                     # Environment variables
│   ├── index.js                 # Main server file
│   ├── package.json
│   └── package-lock.json
│
├── client/
│   ├── index.html               # Main HTML
│   ├── style.css                # Styles
│   └── script.js                # WebSocket client
│
└── README.md
```

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

---

## 👨‍💻 **Author**

**Adyasha Nanda**
- GitHub: [@Adyasha56](https://github.com/Adyasha56)
---

---

## 🔮 **Future Enhancements**

- [ ] User authentication
- [ ] File sharing support
- [ ] Message encryption
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Emoji support
- [ ] Voice messages
- [ ] Video chat integration

---

<div align="center">

### ⭐ **Star this repo if you found it helpful!** ⭐

Made with ❤️ by **Adyasha Nanda**

</div>

---
