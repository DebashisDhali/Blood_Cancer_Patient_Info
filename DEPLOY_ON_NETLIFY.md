# DEPLOY ON NETLIFY - COMPLETE GUIDE

এই গাইড আপনাকে Netlify-তে নিরাপদভাবে আপনার ব্লাড ক্যান্সার পেশেন্ট প্ল্যাটফর্ম ডিপ্লয় করতে সাহায্য করবে।

---

## Step 1: GitHub এ কোড আপলোড করুন

```bash
git init
git add .
git commit -m "Blood cancer patient platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blood-cancer-patient.git
git push -u origin main
```

---

## Step 2: MongoDB Atlas সেটআপ করুন (Database)

1. https://www.mongodb.com/cloud/atlas এ যান
2. Account তৈরি করুন
3. একটি Cluster তৈরি করুন (Free tier OK)
4. Database User তৈরি করুন:
   - Username: `bloodcancer`
   - Password: `StrongPassword123!`
5. Connection String কপি করুন:
   ```
   mongodb+srv://bloodcancer:StrongPassword123@cluster.mongodb.net/blood-cancer?retryWrites=true&w=majority
   ```

---

## Step 3: Backend ডিপ্লয় করুন (Heroku অথবা Render)

### Option A: RENDER ব্যবহার করুন (সহজ)

1. https://render.com এ যান
2. GitHub দিয়ে লগইন করুন
3. "New +" → "Web Service"
4. আপনার repository সিলেক্ট করুন
5. সেটিংস:
   - **Name**: blood-cancer-api
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
6. **Environment Variables** যোগ করুন:
   ```
   MONGODB_URI=mongodb+srv://bloodcancer:StrongPassword123@cluster.mongodb.net/blood-cancer
   JWT_SECRET=your_super_long_secret_key_min_32_chars_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-site.netlify.app
   ENCRYPTION_KEY=32_character_encryption_key_here
   ```
7. Deploy করুন

আপনার Backend URL পাবেন যেমন: `https://blood-cancer-api.onrender.com`

### Option B: HEROKU ব্যবহার করুন

1. https://heroku.com এ যান
2. New → Create new app
3. Terminal এ:
```bash
heroku login
heroku create blood-cancer-api
git push heroku main
```
4. Environment Variables সেট করুন:
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret_key
heroku config:set CLIENT_URL=your_netlify_domain
```

---

## Step 4: Netlify এ Frontend ডিপ্লয় করুন

### সবচেয়ে গুরুত্বপূর্ণ: Environment Variables

আপনার **backend URL** জানুন (Step 3 থেকে), তারপর:

1. https://netlify.com এ যান
2. আপনার GitHub account দিয়ে লগইন করুন
3. **"Add new site" → "Import an existing project"**
4. আপনার repository সিলেক্ট করুন
5. **Build settings:**
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`
6. **Deploy site** ক্লিক করুন

### Environment Variables সেট করুন

Netlify Dashboard → **Site settings → Build & deploy → Environment:**

নতুন ভেরিয়েবল যোগ করুন:
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://blood-cancer-api.onrender.com/api` (আপনার backend URL)

---

## Step 5: এখন সবকিছু সংযুক্ত করুন

### Backend এ Client URL আপডেট করুন

Render/Heroku Dashboard এ:
- `CLIENT_URL` = `https://your-netlify-site.netlify.app`

এটা CORS এর জন্য প্রয়োজন যাতে Frontend ও Backend কথা বলতে পারে।

---

## Step 6: নিরাপত্তা যাচাইকরণ

## ✅ SECURITY CHECKLIST

- [ ] `.env` ফাইল GitHub এ কমিট করেননি
- [ ] `JWT_SECRET` অনন্য এবং 32+ characters
- [ ] `ENCRYPTION_KEY` 32 characters
- [ ] `MONGODB_URI` সঠিক
- [ ] `CLIENT_URL` সঠিক (HTTPS সহ)
- [ ] Backend এ CORS enabled
- [ ] সব environment variables Netlify/Render এ সেট

---

## Step 7: প্রথম Admin Account তৈরি করুন

1. আপনার website খুলুন: `https://your-site.netlify.app`
2. **Register** ক্লিক করুন
3. নতুন admin account তৈরি করুন:
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `StrongPassword123!`
4. লগইন করুন → **Admin Dashboard** দেখুন

---

## Step 8: আপনার প্রথম Patient যোগ করুন

Admin Dashboard থেকে:
1. নতুন Patient information ভরুন
2. Photo আপলোড করুন
3. Fundraising campaign তৈরি করুন
4. Public page থেকে দেখুন এবং donation টেস্ট করুন

---

## Sensitive Information এ নিরাপত্তা

### কোথায় কী নিরাপদ রাখতে হবে:

| তথ্য | কোথায় | কিভাবে |
|------|--------|--------|
| `JWT_SECRET` | Render/Heroku env | Long random string |
| `MONGODB_URI` | Render/Heroku env | Never in code |
| `ENCRYPTION_KEY` | Render/Heroku env | Never share |
| `REACT_APP_API_URL` | Netlify env | Your backend URL |
| Patient Data | MongoDB | Encrypted at rest |
| Passwords | MongoDB | Hashed (bcryptjs) |

### পেশেন্ট ডেটা মাস্কিং (নিরাপত্তার জন্য)

- **Public view**: শুধু নাম, বয়স, ফোটো, ক্যান্সার type
- **Admin view**: সব তথ্য (নাম, ফোন, email, ঠিকানা সহ)
- **Phone number**: মাস্ক করা হয় (XXXXXXXXX)
- **Email**: মাস্ক করা হয় (a****@example.com)

---

## Common Issues সমাধান

### "API Connection Error"
```
সমস্যা: Frontend সংযুক্ত হতে পারছে না Backend এর সাথে
সমাধান:
1. REACT_APP_API_URL সঠিক আছে কি? (Netlify env)
2. Backend URL এ /api লাগান
3. Backend চালু আছে কি? (Render/Heroku এ check করুন)
```

### "Database Connection Error"
```
সমস্যা: MongoDB তে সংযুক্ত হতে পারছে না
সমাধান:
1. MONGODB_URI সঠিক?
2. MongoDB Atlas এ IP whitelist করুন: 0.0.0.0/0
3. Username/password সঠিক?
```

### "Donation Not Working"
```
সমস্যা: Donation ফর্ম submit হচ্ছে না
সমাধান:
1. Backend URL সঠিক?
2. Fund ID আছে?
3. Browser console এ error দেখুন (F12)
4. Backend logs check করুন
```

---

## ডোমেইন কাস্টমাইজ করুন

### নিজের Domain ব্যবহার করুন

**Netlify:**
1. Site settings → Custom domains
2. আপনার domain যোগ করুন (namecheap.com এ কিনুন)

**Backend (Render/Heroku):**
1. Settings → Custom domains
2. CNAME record যোগ করুন

---

## লাইভ আপডেট কীভাবে কাজ করে

### Real-time Features:
1. **Admin Dashboard**: সব patients এর তথ্য রিয়েল-টাইমে আপডেট হয়
2. **Donation Progress**: Donors দেখতে পারে fund এ কত টাকা জমা হয়েছে
3. **Document Status**: Medical documents verified অথবা pending দেখা যায়

---

## Monthly Cost Estimate

| Service | Free Tier | Cost |
|---------|-----------|------|
| Netlify | ✅ Free | $0 |
| Render | ❌ (trial only) | $7/month |
| MongoDB Atlas | ✅ Free (512MB) | $0-$57/month |
| **Total** | | **$7-64/month** |

---

## Next Steps

1. ✅ GitHub এ Push করুন
2. ✅ MongoDB Atlas সেটআপ করুন
3. ✅ Backend Render/Heroku এ ডিপ্লয় করুন
4. ✅ Frontend Netlify এ ডিপ্লয় করুন
5. ✅ Admin account তৈরি করুন
6. ✅ পেশেন্ট যোগ করুন
7. ✅ Donation টেস্ট করুন
8. ✅ শেয়ার করুন supporters এর সাথে

---

## সাহায্য চাই?

যদি কোনো সমস্যা হয়:
1. Browser console check করুন (F12)
2. Backend logs check করুন
3. MongoDB Atlas status check করুন
4. Environment variables double-check করুন

---

## Important Security Tips

⚠️ **কখনো করবেন না:**
- Secret keys GitHub এ commit করবেন না
- Password plain text এ রাখবেন না
- Phone number public view এ দেখাবেন না
- Admin password কাউকে শেয়ার করবেন না

✅ **সবসময় করবেন:**
- Strong passwords ব্যবহার করুন (12+ chars)
- HTTPS ব্যবহার করুন (Netlify করে)
- Regular backups নিন
- Security updates চেক করুন (npm audit)

---

## আপনি এখন প্রস্তুত! 🎉

আপনার নিরাপদ blood cancer patient platform এখন Netlify এ লাইভ!

মনে রাখুন: **Patient privacy সবচেয়ে গুরুত্বপূর্ণ!**
