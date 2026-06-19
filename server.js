const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { 
  cors: { origin: '*' } 
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Schema
const pollSchema = new mongoose.Schema({
  pollId: { type: String, unique: true, required: true },
  title: String,
  options: [
    { text: String, votes: { type: Number, default: 0 } }
  ],
  votedIPs: [String],
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);

// REST API - Get poll by ID
app.get('/api/poll/:pollId', async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollId: req.params.pollId });
    res.json(poll || { error: 'Poll not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new poll
app.post('/api/poll', async (req, res) => {
  try {
    const { title, options } = req.body;
    const pollId = 'poll_' + Date.now();
    
    const poll = new Poll({
      pollId,
      title,
      options: options.map(text => ({ text, votes: 0 })),
      votedIPs: []
    });
    
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cast vote
app.post('/api/vote/:pollId', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const clientIP = req.ip;
    
    const poll = await Poll.findOne({ pollId: req.params.pollId });
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    // Check if user already voted
    if (poll.votedIPs.includes(clientIP)) {
      return res.status(400).json({ error: 'You already voted!' });
    }
    
    // Increment vote
    poll.options[optionIndex].votes += 1;
    poll.votedIPs.push(clientIP);
    
    await poll.save();
    
    // Broadcast update to ALL connected clients in real-time
    io.emit('vote_update', { pollId: poll.pollId, poll });
    
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSocket connections for real-time updates
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  socket.on('join_poll', (pollId) => {
    socket.join(pollId);
    console.log('📊 User joined poll:', pollId);
  });
  
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
