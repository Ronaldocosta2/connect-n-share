const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let waitingUsers = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('ready', (data) => {
    console.log('User ready:', socket.id, 'Preferences:', data.preferences);
    
    // Store user info along with socket
    const userToQueue = {
      id: socket.id,
      socket: socket,
      preferences: data.preferences
    };

    // Find a match based on strict preferences
    const matchIndex = waitingUsers.findIndex(u => {
      // Don't match with self (shouldn't happen, but safe)
      if (u.id === socket.id) return false;
      
      // Check country preference: must match exactly
      const countryMatch = (u.preferences.country === data.preferences.country);
      
      // Check gender preference: must match exactly 
      const genderMatch = (u.preferences.gender === data.preferences.gender);

      return countryMatch && genderMatch;
    });

    if (matchIndex !== -1) {
      // Match found!
      const peer1 = waitingUsers[matchIndex].socket;
      const peer2 = socket;
      
      console.log(`Matching ${peer1.id} with ${peer2.id} (Strict Match)`);
      
      // Remove peer1 from waiting list
      waitingUsers.splice(matchIndex, 1);
      
      // Tell peer1 they are matched with peer2 (peer1 will be the initiator)
      peer1.emit('match', { peerId: peer2.id });
      // We do NOT emit match to peer2. peer2 will initialize when it receives the first signal.
      
    } else {
      // Nobody waiting matches these exact preferences, so add to queue
      console.log('User waiting for strict match:', socket.id);
      waitingUsers.push(userToQueue);
    }
  });

  socket.on('signal', (data) => {
    // data should contain { to: string, data: any }
    console.log(`Signal from ${socket.id} to ${data.to}`);
    io.to(data.to).emit('signal', {
      from: socket.id,
      data: data.data
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }
    // WebRTC connection will be handled by the simple-peer 'close' event
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
