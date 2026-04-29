# Blood Cancer Patient Support Platform - Setup Instructions

## Overview
This is a secure MERN stack web application for managing blood cancer patient information with fundraising and document management features. It's designed for Netlify deployment with security as a top priority.

## Quick Setup

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials:
# - MONGODB_URI from MongoDB Atlas
# - JWT_SECRET (create a random 32+ char string)
# - ENCRYPTION_KEY (create a random 32 char string)
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env:
# - REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### 3. Database Setup (MongoDB Atlas)
- Create MongoDB Atlas account
- Create a cluster
- Get connection string
- Add to backend .env as MONGODB_URI
- Create first admin account via /register endpoint

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/blood-cancer
JWT_SECRET=your_super_secret_32_char_minimum_string
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
ENCRYPTION_KEY=your_32_char_encryption_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Netlify Deployment

### Step 1: Connect GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Step 2: Deploy Frontend on Netlify
1. Go to netlify.com
2. New site from Git → Select repository
3. Build settings:
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`
4. Add Environment Variables:
   - REACT_APP_API_URL=your-backend-url/api
5. Deploy!

### Step 3: Deploy Backend (Choose One)
**Option A: Heroku**
```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
```

**Option B: Render**
- Connect GitHub repo to render.com
- Create new web service
- Set environment variables in Render dashboard

**Option C: AWS/DigitalOcean**
- Follow their Node.js deployment guides
- Set environment variables in their dashboard

### Step 4: Update CORS in Backend
Update `CLIENT_URL` in backend to your Netlify domain:
```
https://your-site.netlify.app
```

## Security Checklist

- [ ] Unique JWT_SECRET set (32+ characters)
- [ ] MONGODB_URI configured correctly
- [ ] CLIENT_URL updated to Netlify domain
- [ ] ENCRYPTION_KEY created (32 characters)
- [ ] Environment variables NOT in .env files committed to git
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] CORS properly configured
- [ ] Admin account created
- [ ] Test login works
- [ ] Test donation form works
- [ ] Test patient photo upload works

## Testing

### Login with Default Admin
Create first admin via register endpoint:
- Username: admin
- Email: admin@example.com
- Password: Strong@Password123

### Test Donations
1. Create patient via admin dashboard
2. Create fundraising campaign for patient
3. Test donation from public page

### Test Documents
1. Upload medical document as admin
2. Verify document from admin panel
3. Check document appears in patient view

## Monitoring & Maintenance

### Logs
- **Frontend**: Check Netlify dashboard Analytics
- **Backend**: Check your deployment provider's logs
- **Database**: MongoDB Atlas monitoring

### Updates
```bash
# Check for updates
npm audit
npm update

# Keep dependencies secure
npm audit fix
```

## Troubleshooting

**Cannot connect to API**
- Check REACT_APP_API_URL is correct
- Verify backend is running
- Check CORS settings in backend

**Donations not saving**
- Verify MongoDB connection
- Check backend logs for errors
- Verify fund ID exists

**Login fails**
- Verify JWT_SECRET is set
- Check admin account exists in database
- Clear browser cache and try again

**Photo upload fails**
- Check file size < 5MB
- Verify MongoDB has space
- Check backend error logs

## Support Documents
- [SECURITY.md](./SECURITY.md) - Detailed security information
- [README.md](./README.md) - Complete project documentation

## Next Steps
1. Deploy backend
2. Deploy frontend
3. Test all features
4. Share with patients and supporters
5. Monitor performance
