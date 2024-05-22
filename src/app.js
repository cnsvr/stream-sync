const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { ExpressPeerServer } = require('peer');


const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors());

// PeerJS sunucusunu oluşturma
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/myapp'
});
app.use('/peerjs', peerServer);

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
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err.message));
