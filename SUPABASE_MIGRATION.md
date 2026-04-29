# 🔄 MongoDB to Supabase Migration Guide

## Overview

আপনার backend MongoDB এর পরিবর্তে **Supabase PostgreSQL** ব্যবহার করছে। এই গাইড ধাপে ধাপে conversion দেখায়।

---

## ✅ ইতিমধ্যে সম্পন্ন হয়েছে:

- ✅ `server.js` - Supabase client initialization
- ✅ `package.json` - @supabase/supabase-js dependency যোগ করা হয়েছে
- ✅ `config/supabaseClient.js` - Supabase configuration file
- ✅ Supabase tables SQL - FREE_DEPLOYMENT.md এ প্রদান করা হয়েছে

---

## 📝 এখন করতে হবে:

### Step 1: Package Install করুন

```bash
cd server
npm install
```

এটি `@supabase/supabase-js` এবং `pg` package install করবে।

---

### Step 2: Routes Update করুন

প্রতিটি route file update করা দরকার। এখানে example:

#### Example: `authRoutes.js` Conversion

**MongoDB Version (OLD):**
```javascript
const Admin = require('../models/Admin');

// Register
const admin = new Admin({ username, email, password });
await admin.save();
```

**Supabase Version (NEW):**
```javascript
const supabase = require('../config/supabaseClient');

// Register
const { data, error } = await supabase
  .from('admins')
  .insert([{ username, email, password_hash }])
  .select();

if (error) throw error;
```

---

### Step 3: Key Differences

| Aspect | MongoDB | Supabase |
|--------|---------|----------|
| Insert | `.save()` | `.insert()` |
| Find | `.findById()` | `.select().eq()` |
| Update | `.findByIdAndUpdate()` | `.update().eq()` |
| Delete | `.findByIdAndDelete()` | `.delete().eq()` |
| Query | Chaining | Method chaining |

---

### Step 4: File Uploads (Photos, Documents)

MongoDB এ files binary হিসেবে store করা ছিল। Supabase এ দুটি option:

**Option A: Supabase Storage (Recommended)**
```javascript
// Upload file
const { data, error } = await supabase
  .storage
  .from('patients')
  .upload(`patient-${id}.jpg`, fileBuffer);

// Get public URL
const { data: { publicUrl } } = supabase
  .storage
  .from('patients')
  .getPublicUrl(`patient-${id}.jpg`);
```

**Option B: Database এ Binary Store করুন (সরল)**
```javascript
// ছবি bytea হিসেবে store করুন
const { data, error } = await supabase
  .from('patients')
  .update({ photo: fileBuffer })
  .eq('id', patientId);
```

---

## 🚀 একটি Route সম্পূর্ণ Conversion Example

### Original MongoDB Version (authRoutes.js):
```javascript
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const admin = new Admin({ username, email, password });
    await admin.save();
    
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### Converted Supabase Version:
```javascript
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Hash password
    const password_hash = await bcryptjs.hash(password, 10);
    
    // Insert to Supabase
    const { data, error } = await supabase
      .from('admins')
      .insert([{ username, email, password_hash }])
      .select();
    
    if (error) throw error;
    
    const admin = data[0];
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

---

## 📋 Conversion Checklist

### authRoutes.js
- [ ] Register endpoint convert
- [ ] Login endpoint convert
- [ ] Verify endpoint convert

### patientRoutes.js
- [ ] GET all patients convert
- [ ] GET single patient convert
- [ ] POST create patient convert
- [ ] PUT update patient convert
- [ ] Photo upload convert

### fundRoutes.js
- [ ] GET funds by patient convert
- [ ] POST create fund convert
- [ ] PUT update fund convert
- [ ] GET donations list convert

### documentRoutes.js
- [ ] GET documents convert
- [ ] POST upload document convert
- [ ] PUT verify document convert
- [ ] DELETE document convert

### adminRoutes.js
- [ ] GET stats convert
- [ ] GET all patients with funds convert

---

## 🔧 Middleware Update

### auth.js (JWT Verification)

**Before:**
```javascript
// MongoDB: user._id
const user = await Admin.findById(decoded.id);
```

**After:**
```javascript
// Supabase: user.id
const { data: user } = await supabase
  .from('admins')
  .select()
  .eq('id', decoded.id)
  .single();
```

---

## 🐛 Common Issues & Fixes

### Issue 1: UUID vs String IDs
- MongoDB: `_id` as ObjectId
- Supabase: `id` as UUID string

**Fix:** Replace all `admin._id` with `admin.id`

### Issue 2: Timestamps
- MongoDB: Auto `createdAt`/`updatedAt` with `timestamps: true`
- Supabase: Explicit `CURRENT_TIMESTAMP`

**Fix:** Already added in SQL creation

### Issue 3: Data Relationships
- MongoDB: ObjectId references
- Supabase: UUID foreign keys

**Fix:** Ensure UUIDs are properly used

---

## 📚 Supabase Query Examples

### Insert Single Record
```javascript
const { data, error } = await supabase
  .from('patients')
  .insert([{ name, age, gender }])
  .select();
```

### Find Records
```javascript
const { data, error } = await supabase
  .from('patients')
  .select()
  .eq('id', patientId);
```

### Update Record
```javascript
const { data, error } = await supabase
  .from('patients')
  .update({ name, age })
  .eq('id', patientId)
  .select();
```

### Delete Record
```javascript
const { data, error } = await supabase
  .from('patients')
  .delete()
  .eq('id', patientId);
```

### Join Query (Patients with Funds)
```javascript
const { data, error } = await supabase
  .from('patients')
  .select(`
    *,
    funds(*)
  `)
  .eq('status', 'active');
```

---

## 🚀 Deploy করার পর Test করুন

```bash
# Backend test করুন
curl https://your-backend.vercel.app/api/health

# Response হবে:
# { "status": "Server is running", "database": "Supabase Connected" }
```

---

## 📞 Need Help?

যদি conversion এ সমস্যা হয়:

1. **Supabase Documentation:** https://supabase.com/docs
2. **PostgreSQL Syntax:** https://www.postgresql.org/docs/
3. **Error Messages:** Check Vercel logs এবং Supabase console

---

**অভিনন্দন! এখন আপনার backend Supabase PostgreSQL এ চলছে!** 🎉
