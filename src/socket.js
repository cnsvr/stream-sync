const { Server } = require('socket.io');
const Chat = require('./models/Chat');

function initializeSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on('joinMeeting', ({ meetingId, peerId }) => {
      socket.join(meetingId);
      socket.to(meetingId).emit('userJoined', { peerId });
    });

    socket.on('leaveMeeting', ({ meetingId, peerId }) => {
      socket.to(meetingId).emit('userLeft', { peerId });
      socket.leave(meetingId);
    });

    socket.on('chatMessage', async ({ meetingId, sender, receiver, message }) => {
      try {
        const chat = new Chat({
          meetingId,
          sender,
          receiver,
          message
        });
        await chat.save();
        // Gelen mesajı tüm katılımcılara yayın
        io.to(meetingId).emit('newChatMessage', { meetingId, sender, message });
      } catch (error) {
        console.error('Error saving chat message:', error.message);
      }
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = initializeSocket;
