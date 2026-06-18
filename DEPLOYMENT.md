# 🌐 Deployment Guide

## Option 1: Deploy to Render.com (EASIEST - FREE)

### Step 1: Create MongoDB Atlas Database
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (select M0 Free Tier)
4. Click "Connect"
5. Choose "Drivers"
6. Copy connection string
7. Replace `<password>` with your database password

### Step 2: Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub account
3. Click "New +" → "Web Service"
4. Connect your `joke` repository
5. Fill in:
   - **Name**: `school-evoting`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   ```
   MONGODB_URI = your_mongodb_connection_string
   NODE_ENV = production
   ADMIN_PASSWORD = JORDAN
   PORT = 3000
   ```
7. Click Deploy
8. Wait 2-3 minutes
9. Get your live URL! 🎉

### Step 3: Share the Link
Your app is now live! Share the URL with students.

---

## Option 2: Deploy to Railway.app

1. Go to https://railway.app
2. Login with GitHub
3. Create new project
4. Select "Deploy from GitHub repo"
5. Choose `joke`
6. Add variables:
   - `MONGODB_URI=your_connection_string`
   - `ADMIN_PASSWORD=JORDAN`
7. Deploy!

---

## Option 3: Deploy to Heroku

### Prerequisites
- Heroku CLI installed
- Heroku account

### Steps
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-evoting-app

# Set environment variables
heroku config:set MONGODB_URI=your_connection_string
heroku config:set ADMIN_PASSWORD=JORDAN
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

---

## Option 4: Docker Compose (Local)

```bash
# Install Docker and Docker Compose first

# Run everything
docker-compose up

# Visit http://localhost:3000
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Use strong MongoDB credentials
- [ ] Enable HTTPS (automatic on Render/Heroku)
- [ ] Add MongoDB IP whitelist
- [ ] Use environment variables for secrets
- [ ] Keep Node.js dependencies updated
- [ ] Enable database authentication

---

## 📊 Testing After Deployment

1. Open the live URL
2. Try voting with test IDs: `STUDENT001` - `STUDENT008`
3. Check Live Board for real-time updates
4. Test Admin panel with password: `JORDAN`
5. View audit logs

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist includes deployment IP
- Verify database username/password

### "Real-time updates not working"
- Check WebSocket is enabled
- Verify Socket.io in browser console
- Check server logs for errors

### "Page is blank"
- Check server logs
- Verify all environment variables are set
- Check browser console for errors

### "Votes not saving"
- Verify MongoDB connection
- Check server logs
- Ensure database has write permissions

---

## 📞 Support

For help:
1. Check server logs
2. Review browser console
3. Verify environment variables
4. Check MongoDB status
