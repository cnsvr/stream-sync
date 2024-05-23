const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors : { origin: "*" } });

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/meeting", require("./routes/meetingRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: err.message });
});


// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    io.on("connection", (socket) => {
      console.log("User connected", socket.id);
    
      socket.on('joinMeeting', ({ meetingId, peerId }) => {
        socket.join(meetingId);
        socket.to(meetingId).emit('userJoined', { peerId });
      });
    
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
    
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err.message));
