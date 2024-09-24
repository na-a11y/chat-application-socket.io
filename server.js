// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const users = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining the chat with a username
  socket.on('joinChat', (username) => {
    socket.username = username;
    users.push(username);
    io.emit('userList', users);
    io.emit('userJoined', username);
    console.log(`${username} joined the chat.`);
  });

  // Listen for incoming messages from clients
  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', { id: socket.username || socket.id, msg });
  });

  // Handle private messaging
  socket.on('privateMessage', ({ targetUser, msg }) => {
    const targetSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.username === targetUser
    );
    if (targetSocket) {
      targetSocket.emit('privateMessage', { from: socket.username, msg });
    }
  });

  // Notify other users when someone is typing
  socket.on('typing', () => {
    if (socket.username) {
      socket.broadcast.emit('userTyping', socket.username);
    }
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const index = users.indexOf(socket.username);
    if (index !== -1) users.splice(index, 1);
    io.emit('userList', users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
