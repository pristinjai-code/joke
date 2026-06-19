# 📊 Real-Time Voting System

A modern, real-time voting system built with Node.js, Express, MongoDB, and Socket.IO. Create polls, share links, and see live vote updates instantly across all connected devices.

## ✨ Features

- ✅ **Create Polls** - Add custom questions and options
- ✅ **Real-Time Updates** - All connected users see votes update instantly (no refresh needed)
- ✅ **Shareable Links** - Anyone can access polls via unique URL
- ✅ **Vote Tracking** - Prevents duplicate votes per IP address
- ✅ **Mobile Responsive** - Works on any device
- ✅ **Live Indicator** - Visual indicator showing real-time updates are active
- ✅ **Automatic Board Refresh** - Voters' board refreshes immediately after each vote
- ✅ **Beautiful UI** - Modern gradient design with smooth animations

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time Communication**: WebSocket (Socket.IO)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier available)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/pristinjai-code/joke.git
cd joke
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/voting?retryWrites=true&w=majority
PORT=5000
```

### 3. Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Click "Connect" and copy your connection string
4. Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your credentials

### 4. Run the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 5. Access the Application

Open your browser and go to:

```
http://localhost:5000
```

## 📱 How to Use

1. **Create a Poll**
   - Enter your question
   - Add at least 2 options
   - Click "Create Poll"

2. **Share the Poll**
   - Copy the generated link
   - Send it to anyone
   - They can vote immediately

3. **Vote in Real-Time**
   - Click the "Vote" button on any option
   - The board updates automatically for everyone
   - All connected voters see results instantly

## 🌐 Deployment

### Deploy on Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway deploy
```

### Deploy on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create "New Web Service"
4. Connect your GitHub repo
5. Add environment variables
6. Deploy

### Deploy on Heroku

```bash
npm install -g heroku
heroku login
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI="your_connection_string"
```

## 📊 How Real-Time Updates Work

1. User casts a vote
2. Vote is saved to MongoDB
3. Server broadcasts update via Socket.IO to all connected clients
4. All voters' boards automatically refresh instantly
5. No manual refresh needed!

## 🔒 Security Features

- **Vote Deduplication**: One vote per IP address
- **Input Validation**: Server-side validation
- **CORS Protection**: Configurable origin control
- **MongoDB Security**: Connection string not exposed in frontend

## 📝 API Endpoints

### GET `/api/poll/:pollId`
Fetch a specific poll

```bash
curl http://localhost:5000/api/poll/poll_1234567890
```

### POST `/api/poll`
Create a new poll

```bash
curl -X POST http://localhost:5000/api/poll \
  -H "Content-Type: application/json" \
  -d '{"title": "Favorite Color?", "options": ["Red", "Blue", "Green"]}'
```

### POST `/api/vote/:pollId`
Cast a vote

```bash
curl -X POST http://localhost:5000/api/vote/poll_1234567890 \
  -H "Content-Type: application/json" \
  -d '{"optionIndex": 0}'
```

## 🎯 Future Enhancements

- User authentication
- Poll expiration
- Edit/delete polls
- Vote analytics and charts
- Multiple voting methods (ranked choice, etc.)
- Dark mode
- PDF export

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to open issues or PRs.

## ❓ Support

Having issues? Check:
- MongoDB connection string is correct
- Port 5000 is available
- All dependencies are installed (`npm install`)
- Server is running (`npm start`)
