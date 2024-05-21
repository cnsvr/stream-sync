const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/meeting", require("./routes/meetingRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: err.message });
});

io.on('connection', (socket) => {
  socket.on('joinMeeting', ({ meetingId, userId }) => {
    socket.join(meetingId);
    console.log(`User ${userId} joined meeting ${meetingId}`);
    socket.broadcast.to(meetingId).emit('userJoined', { userId });

    socket.on('sendVideo', (data) => {
      socket.broadcast.to(meetingId).emit('receiveVideo', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', reason);
      socket.broadcast.to(meetingId).emit('userDisconnected', { userId });
    });
  });

  socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
  });
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
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err.message));
