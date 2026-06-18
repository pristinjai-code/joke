const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Environment Variables
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evoting';
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'JORDAN';

// MongoDB Connection
let db;
const client = new MongoClient(MONGO_URI);

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('evoting');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

// Initialize Collections
const initCollections = async () => {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('students')) {
      await db.createCollection('students');
    }
    if (!collectionNames.includes('votes')) {
      await db.createCollection('votes');
    }
    if (!collectionNames.includes('credentials')) {
      await db.createCollection('credentials');
    }
    if (!collectionNames.includes('election')) {
      await db.createCollection('election');
      const existing = await db.collection('election').findOne({ _id: 'settings' });
      if (!existing) {
        await db.collection('election').insertOne({
          _id: 'settings',
          isOpen: true,
          createdAt: new Date()
        });
      }
    }
    if (!collectionNames.includes('auditLog')) {
      await db.createCollection('auditLog');
    }
    console.log('✅ Collections initialized');
  } catch (error) {
    console.error('Collection initialization error:', error.message);
  }
};

// Helper function to generate token
const generateToken = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Broadcast vote update to all connected clients
const broadcastVoteUpdate = async () => {
  const votes = await db.collection('votes').find({}).toArray();
  io.emit('vote-update', votes);
};

// REST API Routes

// Get election status
app.get('/api/election-status', async (req, res) => {
  try {
    const election = await db.collection('election').findOne({ _id: 'settings' });
    const totalVotes = await db.collection('votes').countDocuments();
    res.json({
      isOpen: election?.isOpen || true,
      totalVotes: totalVotes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Issue credential
app.post('/api/issue-credential', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID required' });
    }

    const election = await db.collection('election').findOne({ _id: 'settings' });
    if (!election.isOpen) {
      return res.status(400).json({ error: 'Election is closed' });
    }

    // Check if student exists
    const student = await db.collection('students').findOne({ studentId });
    if (!student) {
      return res.status(400).json({ error: 'Student ID not in registry' });
    }

    // Check if already voted
    const existingVote = await db.collection('votes').findOne({ studentId });
    if (existingVote) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Check if credential already issued
    let credential = await db.collection('credentials').findOne({ studentId });
    if (!credential) {
      const token = generateToken();
      await db.collection('credentials').insertOne({
        studentId,
        token,
        createdAt: new Date(),
        used: false
      });
      credential = { token };
    }

    res.json({ credential: credential.token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cast vote
app.post('/api/cast-vote', async (req, res) => {
  try {
    const { studentId, credential, votes } = req.body;

    if (!studentId || !credential || !votes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const election = await db.collection('election').findOne({ _id: 'settings' });
    if (!election.isOpen) {
      return res.status(400).json({ error: 'Election is closed' });
    }

    // Verify credential
    const cred = await db.collection('credentials').findOne({ studentId, token: credential });
    if (!cred) {
      return res.status(400).json({ error: 'Invalid credential' });
    }

    if (cred.used) {
      return res.status(400).json({ error: 'Credential already used' });
    }

    // Check if already voted
    if (await db.collection('votes').findOne({ studentId })) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Record vote
    const tracker = generateToken() + Date.now();
    const voteRecord = {
      studentId,
      votes,
      tracker,
      timestamp: new Date()
    };

    await db.collection('votes').insertOne(voteRecord);
    await db.collection('credentials').updateOne({ studentId }, { $set: { used: true } });

    // Log audit
    await db.collection('auditLog').insertOne({
      action: 'VOTE_CAST',
      studentId,
      tracker,
      timestamp: new Date()
    });

    // Broadcast update to all clients
    broadcastVoteUpdate();

    res.json({ tracker, message: 'Vote recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all votes (for admin)
app.post('/api/get-votes', async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const votes = await db.collection('votes').find({}).toArray();
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close election (admin)
app.post('/api/close-election', async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await db.collection('election').updateOne({ _id: 'settings' }, { $set: { isOpen: false } });
    io.emit('election-closed');

    await db.collection('auditLog').insertOne({
      action: 'ELECTION_CLOSED',
      timestamp: new Date()
    });

    res.json({ message: 'Election closed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Open election (admin)
app.post('/api/open-election', async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await db.collection('election').updateOne({ _id: 'settings' }, { $set: { isOpen: true } });
    io.emit('election-opened');

    await db.collection('auditLog').insertOne({
      action: 'ELECTION_OPENED',
      timestamp: new Date()
    });

    res.json({ message: 'Election opened' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset system (admin)
app.post('/api/reset-system', async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await db.collection('votes').deleteMany({});
    await db.collection('credentials').deleteMany({});
    await db.collection('election').updateOne({ _id: 'settings' }, { $set: { isOpen: true } });
    
    io.emit('system-reset');

    await db.collection('auditLog').insertOne({
      action: 'SYSTEM_RESET',
      timestamp: new Date()
    });

    res.json({ message: 'System reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit log (admin)
app.post('/api/audit-log', async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const logs = await db.collection('auditLog').find({}).sort({ timestamp: -1 }).toArray();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search tracker
app.get('/api/search-tracker/:tracker', async (req, res) => {
  try {
    const { tracker } = req.params;
    const vote = await db.collection('votes').findOne({ tracker });
    
    if (vote) {
      res.json(vote);
    } else {
      res.status(404).json({ error: 'Tracker not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Send current votes on connection
  socket.on('request-votes', async () => {
    const votes = await db.collection('votes').find({}).toArray();
    socket.emit('vote-update', votes);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// 404 Handler - Serve index.html for all unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const startServer = async () => {
  await connectDB();
  await initCollections();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Open on any device and share the link!`);
  });
};

startServer().catch(console.error);

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await client.close();
  process.exit(0);
});
