# 🗳️ School E-Voting System

A real-time, multi-device voting system for schools with live synchronization across all connected devices.

## ✨ Features

✅ **Real-time Synchronization** - All devices see vote updates instantly  
✅ **Multi-Device Support** - Vote from phone, laptop, tablet  
✅ **Persistent Storage** - MongoDB database for permanent records  
✅ **Live Dashboard** - Real-time vote counts and leaderboards  
✅ **Secure Voting** - Prevent double voting with credentials  
✅ **Admin Controls** - Open/close elections, view results, audit logs  
✅ **Responsive Design** - Works perfectly on all screen sizes  
✅ **Vote Verification** - Search and verify votes by tracker ID  

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Real-time**: Socket.io for WebSocket communication
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Render, Railway, Heroku, Docker

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas cloud)
- npm or yarn package manager

## 🚀 Quick Start (Local)

### 1. Clone Repository
```bash
git clone https://github.com/pristinjai-code/joke.git
cd joke
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
```bash
cp .env.example .env
```

### 4. Set Up MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create a cluster (free tier available)
- Get connection string
- Add to .env: `MONGODB_URI=your_connection_string`

**Option B: Local MongoDB**
- Install MongoDB locally
- Connection string: `mongodb://localhost:27017/evoting`

### 5. Start Development Server
```bash
npm run dev
```

Server runs on: **http://localhost:3000**

### 6. Seed Test Students (Optional)
```bash
npm run seed
```

Test IDs: `STUDENT001` to `STUDENT008`

## 📖 Usage

### For Students
1. Open the voting link on any device
2. Enter your Student ID
3. Click "Get Credential" to receive unique credential
4. Select candidates for each position
5. Click "Cast Vote"
6. View real-time results on "Live Board" tab

### For Admin
1. Go to "Admin" tab
2. Enter password (default: JORDAN)
3. **Open/Close Election** - Control voting period
4. **Tally Results** - View final vote counts
5. **Audit Log** - See voting history
6. **Reset** - Clear all votes and start over

## 🌐 Deploy to Production

### Option 1: Render.com (FREE, Easiest)

1. **Push code to GitHub** (already done)
2. **Create MongoDB Atlas Cluster**
   - https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string

3. **Deploy to Render**
   - Visit https://render.com
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect `joke` repository
   - Build command: `npm install`
   - Start command: `npm start`
   - Set environment variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     NODE_ENV=production
     ADMIN_PASSWORD=JORDAN
     PORT=3000
     ```
   - Click Deploy
   - Get live URL! 🎉

4. **Share the URL** with students

### Option 2: Railway.app

1. Go to https://railway.app
2. Connect GitHub
3. Create new project
4. Add MongoDB plugin
5. Deploy!

### Option 3: Heroku

```bash
heroku create your-evoting-app
heroku config:set MONGODB_URI=your_connection_string
heroku config:set ADMIN_PASSWORD=JORDAN
git push heroku main
heroku open
```

### Option 4: Docker Compose (Local)

```bash
docker-compose up
```

Visit: http://localhost:3000

## 🔐 Security Checklist

- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Use strong MongoDB credentials
- [ ] Enable HTTPS (automatic on Render/Heroku)
- [ ] Restrict database access by IP
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Rotate credentials periodically

## 📡 API Endpoints

### Public
- `GET /api/election-status` - Get election open/closed status
- `GET /api/search-tracker/:tracker` - Verify vote by tracker ID

### Student
- `POST /api/issue-credential` - Get voting credential
- `POST /api/cast-vote` - Submit vote

### Admin (Requires Password)
- `POST /api/get-votes` - Get all votes
- `POST /api/open-election` - Start voting
- `POST /api/close-election` - Stop voting
- `POST /api/reset-system` - Clear all data
- `POST /api/audit-log` - View activity log

## 🔌 WebSocket Events

- `vote-update` - Emitted when votes are updated
- `election-closed` - Emitted when election closes
- `election-opened` - Emitted when election opens
- `system-reset` - Emitted when system resets

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Verify connection string in .env
- Check internet connection
- Ensure MongoDB Atlas IP whitelist includes your IP
- Check MongoDB credentials

### "Real-time updates not working"
- Check browser console for errors
- Verify WebSocket is enabled
- Check server logs for Socket.io errors
- Try refreshing the page

### "Votes not saving"
- Verify MongoDB is connected
- Check server logs
- Ensure database has write permissions
- Check `.env` configuration

### "Admin panel won't unlock"
- Verify password is correct (case-sensitive)
- Check browser console for errors
- Default password is: `JORDAN`

## ✏️ Customization

### Change Candidates
Edit `public/client.js` - Update the `positions` object:
```javascript
const positions = {
  HEAD_GIRL: ["Your Candidate 1", "Your Candidate 2"],
  // ...
};
```

### Change Admin Password
- Update `.env`: `ADMIN_PASSWORD=your_new_password`
- Restart server

### Add More Students
- Edit `scripts/seed-students.js`
- Run `npm run seed`

### Change Colors
Edit `public/styles.css` - Modify CSS variables:
```css
:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  /* ... */
}
```

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review server logs
3. Check browser console for errors
4. Verify .env configuration

## 📄 License

MIT License - Feel free to use and modify

## 🎓 Educational Use

This system is designed for school student government elections. It promotes:
- Digital literacy
- Democratic participation
- Transparent voting
- Trust in institutions

---

**Made with ❤️ for Student Democracy**
