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

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('ready', (data) => {
    console.log('User ready:', socket.id, 'Preferences:', data.preferences);
    
    // Simplest matching logic: if someone is waiting, match them!
    if (waitingUser && waitingUser.id !== socket.id) {
      const peer1 = waitingUser;
      const peer2 = socket;
      
      console.log(`Matching ${peer1.id} with ${peer2.id}`);
      
      // Tell peer1 they are matched with peer2 (peer1 will be the initiator)
      peer1.emit('match', { peerId: peer2.id });
      // We do NOT emit match to peer2. peer2 will initialize when it receives the first signal.
      
      // Clear waiting user
      waitingUser = null;
    } else {
      // Nobody waiting, so this user becomes the waiting user
      console.log('User waiting for match:', socket.id);
      waitingUser = socket;
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
