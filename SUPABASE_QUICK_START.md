# ⚡ Supabase Quick Start Guide

## আপনার Supabase Credentials

```
Project URL: https://pqacqzrewugadmenyikx.supabase.co
Anon Key: sb_publishable_CPTy6-7f6NMKluomHkITtA_BnVwA7oo
```

---

## 🚀 Backend Setup (Local Development)

### Step 1: Package Install করুন

```bash
cd server
npm install
```

### Step 2: `.env` ফাইল তৈরি করুন

`server/.env` তে এটা paste করুন:

```bash
SUPABASE_URL=https://pqacqzrewugadmenyikx.supabase.co
SUPABASE_ANON_KEY=sb_publishable_CPTy6-7f6NMKluomHkITtA_BnVwA7oo
JWT_SECRET=আপনার_random_32_character_string_এখানে_লিখুন
ENCRYPTION_KEY=আপনার_32_character_key_এখানে_লিখুন
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

### Step 3: Backend Start করুন

```bash
npm run dev
```

Response দেখতে পাবেন:
```
✅ Supabase connected
🚀 Server running on port 5000
```

---

## 🧪 Test করুন

### Health Check:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "Server is running",
  "database": "Supabase Connected"
}
```

---

## 📝 সাধারণ Operations

### ১. Admin Register করুন

```javascript
// server/routes/authRoutes.js (example)
const { data, error } = await supabase
  .from('admins')
  .insert([{
    username: 'admin',
    email: 'admin@example.com',
    password_hash: hashedPassword
  }])
  .select();
```

### ২. Patient Add করুন

```javascript
const { data, error } = await supabase
  .from('patients')
  .insert([{
    name: 'Ali Ahmed',
    age: 25,
    gender: 'male',
    blood_type: 'B+',
    cancer_type: 'Leukemia',
    phone: '01700000000',
    email: 'patient@example.com'
  }])
  .select();
```

### ३. Patients List দেখুন

```javascript
const { data, error } = await supabase
  .from('patients')
  .select('*');

console.log(data); // সব patients
```

### ४. Fund Create করুন

```javascript
const { data, error } = await supabase
  .from('funds')
  .insert([{
    patient_id: 'patient-uuid',
    target_amount: 500000,
    currency: 'BDT',
    description: 'Medical treatment fund'
  }])
  .select();
```

---

## 🔗 Backend Routes (API Endpoints)

আপনার backend routes convert করতে হবে MongoDB থেকে Supabase এ:

### authRoutes.js
- `POST /api/auth/register` - Admin register
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Token verify

### patientRoutes.js
- `GET /api/patients` - সব patients (public)
- `GET /api/patients/:id` - একটি patient (admin only)
- `POST /api/patients` - নতুন patient (admin only)
- `PUT /api/patients/:id` - patient update (admin only)

### fundRoutes.js
- `GET /api/funds/patient/:patientId` - fund info
- `POST /api/funds` - নতুন fund (admin only)
- `PUT /api/funds/:id` - fund update (admin only)

### documentRoutes.js
- `POST /api/documents` - document upload (admin only)
- `GET /api/documents/:patientId` - documents list

### adminRoutes.js
- `GET /api/admin/stats` - dashboard stats
- `GET /api/admin/patients/all` - সব patients with funds

---

## 🛠️ Troubleshooting

### Issue: "Supabase connected ছাড়া error"

**Solution:** `.env` check করুন
```bash
# Verify আপনার credentials সঠিক
echo %SUPABASE_URL%
echo %SUPABASE_ANON_KEY%
```

### Issue: "Cannot connect to Supabase"

**Solution:** 
1. Supabase dashboard open করুন
2. Project settings → API check করুন
3. Credentials copy করুন again

### Issue: "UUID error in database"

এটা Supabase স্বয়ংক্রিয়ভাবে handle করে - কোন চিন্তা নেই!

---

## 📊 Supabase Dashboard দেখুন

1. https://supabase.com → Dashboard
2. আপনার project click করুন
3. **SQL Editor** - queries run করুন
4. **Data** - tables visualize করুন
5. **API** - keys এবং URLs দেখুন

---

## ✅ Deployment Ready

যখন সব locally কাজ করছে:

1. Routes সব convert করুন (MongoDB → Supabase)
2. `npm install` করুন server folder এ
3. GitHub push করুন
4. Vercel deploy করুন (Step 3 follow করুন)

---

**Ready to go! আপনার Supabase backend এখন সম্পূর্ণ সেটআপ!** 🎉
