// public/main.js
const socket = io();

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const typingIndicator = document.getElementById('typing-indicator');
const userList = document.getElementById('user-list');

let currentUser = ''; // Store the current user's username

// Handle joining the chat
joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username; // Store the username
    socket.emit('joinChat', username);
    document.querySelector('.chat-container').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
  }
});

// Display incoming messages
socket.on('chatMessage', (data) => {
  const div = document.createElement('div');
  div.classList.add('message');
  const timestamp = new Date().toLocaleTimeString();
  div.textContent = `[${timestamp}] ${data.id}: ${data.msg}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Display private messages
socket.on('privateMessage', (data) => {
  const div = document.createElement('div');
  div.classList.add('message', 'private');
  div.textContent = `Private from ${data.from}: ${data.msg}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Send message to the server
sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    if (message.startsWith('@')) {
      const parts = message.split(' ');
      const targetUser = parts[0].substring(1);
      const privateMsg = parts.slice(1).join(' ');
      socket.emit('privateMessage', { targetUser, msg: privateMsg });
    } else {
      socket.emit('chatMessage', message);
    }
    messageInput.value = '';
  }
});

// Display typing indicator
messageInput.addEventListener('input', () => {
  if (currentUser) {
    socket.emit('typing'); // Emit 'typing' event without sending the username explicitly
  }
});

socket.on('userTyping', (username) => {
  typingIndicator.textContent = `${username} is typing...`;
  setTimeout(() => {
    typingIndicator.textContent = '';
  }, 2000);
});

// Display the list of online users
socket.on('userList', (users) => {
  userList.innerHTML = '<h3>Online Users:</h3>';
  users.forEach((user) => {
    const userItem = document.createElement('div');
    userItem.textContent = user;
    userList.appendChild(userItem);
  });
});

// Display a message when a user joins
socket.on('userJoined', (username) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.textContent = `${username} has joined the chat`;
  chatBox.appendChild(div);
});
