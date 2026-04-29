# QUICK START GUIDE

## 📋 আপনার Blood Cancer Patient Platform তৈরি হয়েছে! 

এখানে সবকিছু নিরাপদ এবং Netlify deployment এর জন্য প্রস্তুত।

---

## 🚀 5 মিনিটে শুরু করুন

### 1. লোকালি টেস্ট করুন

```bash
# Terminal 1 - Backend
cd server
npm install
cp .env.example .env
# .env এ এটা লাখান: 
# MONGODB_URI=mongodb://localhost:27017/blood-cancer (local MongoDB)
npm run dev

# Terminal 2 - Frontend
cd client
npm install
cp .env.example .env
# .env তে এটা রাখুন:
# REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### 2. Netlify এ Deploy করুন

**Quickest way:**
```bash
git add .
git commit -m "Blood cancer platform ready"
git push origin main
```

তারপর:
1. netlify.com এ যান
2. GitHub connect করুন
3. Repository সিলেক্ট করুন
4. Deploy!

### 3. Environment Variables সেট করুন

**Backend (Render/Heroku):**
```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_32_char_secret_key
ENCRYPTION_KEY=your_32_char_key
CLIENT_URL=https://your-netlify-domain.netlify.app
```

**Frontend (Netlify):**
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 📁 কি তৈরি হয়েছে

```
Blood_Cancer_Patient/
├── server/                      ✅ Backend API
│   ├── models/                  - Database schemas
│   ├── routes/                  - API endpoints
│   ├── middleware/              - Auth logic
│   ├── utils/                   - Helper functions
│   ├── server.js                - Main server file
│   ├── package.json
│   └── .env.example             - Environment template
│
├── client/                      ✅ React Frontend
│   ├── public/                  - Static files
│   ├── src/
│   │   ├── components/          - Reusable components
│   │   ├── pages/               - Page components
│   │   ├── context/             - Auth context
│   │   ├── styles/              - CSS files
│   │   ├── App.js               - Main component
│   │   └── index.js             - React entry
│   ├── package.json
│   └── .env.example
│
├── 📖 Documentation
│   ├── README.md                - Full documentation
│   ├── SECURITY.md              - Security features
│   ├── DEPLOY_ON_NETLIFY.md     - Deploy guide
│   ├── DEPLOYMENT_CHECKLIST.md  - Pre-deploy checks
│   └── QUICK_START.md           - This file
│
├── netlify.toml                 - Netlify config (auto-deploy)
└── .gitignore                   - Ignore sensitive files
```

---

## 🔐 নিরাপত্তা বৈশিষ্ট্য

✅ **অটোমেটিক সেটআপ:**
- JWT authentication with expiration
- Password hashing (bcryptjs)
- Role-based access control
- CORS protection
- Sensitive data masking for public
- Environment variables for secrets

✅ **Manual Configuration Needed:**
- `JWT_SECRET` - Random 32+ char string
- `ENCRYPTION_KEY` - Random 32 char string
- `MONGODB_URI` - Your database connection
- `CLIENT_URL` - Your Netlify domain

---

## 📊 Features

| Feature | Status |
|---------|--------|
| Patient Management | ✅ |
| Fundraising | ✅ |
| Document Upload | ✅ |
| Photo Upload | ✅ |
| Admin Dashboard | ✅ |
| Authentication | ✅ |
| Data Encryption | ✅ |
| Real-time Updates | ✅ |
| Mobile Responsive | ✅ |
| Netlify Ready | ✅ |

---

## 🔗 API Endpoints

**Public Endpoints:**
```
GET  /api/patients              - List all patients
GET  /api/patients/:id/photo    - Get patient photo
GET  /api/funds/patient/:id     - Get fund status
POST /api/funds/:id/donate      - Make donation
```

**Admin Endpoints (require token):**
```
POST   /api/auth/register       - Register admin
POST   /api/auth/login          - Login admin
GET    /api/auth/verify         - Verify token
POST   /api/patients            - Create patient
PUT    /api/patients/:id        - Update patient
POST   /api/patients/:id/photo  - Upload photo
POST   /api/documents           - Upload document
GET    /api/admin/stats         - Dashboard stats
```

---

## 📝 প্রথম ব্যবহার

### ১. Admin Account তৈরি করুন
```
URL: https://your-site.netlify.app/register
Username: admin
Email: admin@example.com
Password: StrongPassword123!
```

### ২. Patient যোগ করুন
```
Dashboard → Create Patient
- নাম, বয়স, ক্যান্সার type
- ডাক্তার তথ্য
- জরুরি যোগাযোগ
- Photo upload
```

### ৩. Fundraising Campaign চালু করুন
```
Dashboard → Create Fund
- Target amount
- Description
- Share with supporters
```

### ৪. Share করুন
```
Public URL: https://your-site.netlify.app/patients
Donors শুধু এখানে donate করতে পারে
Admin শুধু dashboard এ access পায়
```

---

## 🛠 Configuration Files

### `.env.example` (Backend)
```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key_min_32_chars
ENCRYPTION_KEY=your_32_char_key
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-site.netlify.app
```

### `.env.example` (Frontend)
```
REACT_APP_API_URL=https://your-backend.com/api
REACT_APP_ENV=production
```

### `netlify.toml`
```toml
[build]
  command = "cd client && npm run build"
  publish = "client/build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ⚠️ গুরুত্বপূর্ণ নিরাপত্তা টিপস

### ✅ করুন:
- [ ] Strong JWT_SECRET সেট করুন
- [ ] .env ফাইল GitHub এ commit করবেন না
- [ ] HTTPS ব্যবহার করুন (Netlify করে)
- [ ] Patient data সুরক্ষিত রাখুন
- [ ] নিয়মিত backups নিন

### ❌ করবেন না:
- [ ] Secret keys কোডে লাখাবেন না
- [ ] Admin password share করবেন না
- [ ] Patient phone number publicly দেখাবেন না
- [ ] Hardcoded passwords থাকবেন না
- [ ] Unencrypted sensitive data store করবেন না

---

## 🚨 Common Issues

| সমস্যা | সমাধান |
|--------|--------|
| "Cannot connect to API" | REACT_APP_API_URL সঠিক আছে কি? |
| "Login failed" | Backend চালু আছে? MongoDB connected? |
| "Photo not uploading" | File size < 5MB? MongoDB storage ok? |
| "Donation not saving" | Fund ID আছে? Database connected? |
| "Build fails on Netlify" | npm install সঠিক? Build command ok? |

---

## 📚 আরও তথ্য

- **Full Setup**: README.md পড়ুন
- **Security Details**: SECURITY.md দেখুন  
- **Deployment Guide**: DEPLOY_ON_NETLIFY.md অনুসরণ করুন
- **Pre-Deploy Checklist**: DEPLOYMENT_CHECKLIST.md ব্যবহার করুন

---

## 📞 Support

যদি সমস্যা হয়:
1. Browser console check করুন (F12)
2. Backend logs দেখুন
3. README.md এর troubleshooting section পড়ুন
4. SECURITY.md অনুসরণ করুন

---

## ✨ এখন আপনি প্রস্তুত!

```
1. ✅ Code locally test করুন
2. ✅ GitHub এ push করুন
3. ✅ MongoDB Atlas setup করুন
4. ✅ Backend deploy করুন
5. ✅ Frontend Netlify এ deploy করুন
6. ✅ Admin account create করুন
7. ✅ প্রথম patient add করুন
8. ✅ Share করুন supporters এর সাথে
```

**আপনার Secure Blood Cancer Patient Platform এখন লাইভ!** 🎉

---

Last Updated: April 29, 2026
Platform: MERN Stack
Hosting: Netlify (Frontend) + Render/Heroku (Backend)
Database: MongoDB Atlas
