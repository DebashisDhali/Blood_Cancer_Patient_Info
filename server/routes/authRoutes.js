const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const supabase = require('../config/supabaseClient');
const { generateToken } = require('../utils/helpers');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');
const { authMiddleware } = require('../middleware/auth');

// Register Admin
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 🔴 Domain Restriction
    if (!email.toLowerCase().endsWith('@juniv.edu')) {
      return res.status(400).json({ message: 'Registration restricted to @juniv.edu emails only' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`);

    if (checkError) throw checkError;
    if (existingAdmin && existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Hash password
    const password_hash = await bcryptjs.hash(password, 10);
    const verification_token = crypto.randomBytes(32).toString('hex');

    // Insert new admin (unverified)
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert([{ 
        username, 
        email, 
        password_hash, 
        role: 'admin',
        is_verified: false,
        verification_token
      }])
      .select();

    if (insertError) throw insertError;

    // Send Verification Email
    try {
      await sendVerificationEmail(email, verification_token);
    } catch (mailErr) {
      console.error('Mail send fail:', mailErr);
      // We still registered them, but they need a resend option (todo)
    }

    res.status(201).json({
      message: 'Account created! Please check your @juniv.edu email to verify your account.'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

// Verify Email Endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id')
      .eq('verification_token', token)
      .single();

    if (error || !admin) return res.status(400).json({ message: 'Invalid or expired token' });

    await supabase
      .from('admins')
      .update({ is_verified: true, verification_token: null })
      .eq('id', admin.id);

    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #10b981;">Verification Successful!</h1>
        <p>Your account is now active. You can close this tab and log in.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send('Verification failed');
  }
});

// Login Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin by email
    const { data: admins, error: queryError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (queryError || !admins) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔴 Verification Check
    if (admins.is_verified === false) {
      return res.status(403).json({ message: 'Account not verified. Please check your email.' });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, admins.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login (don't await to speed up response)
    supabase
      .from('admins')
      .update({ updated_at: new Date() })
      .eq('id', admins.id);

    const token = generateToken(admins.id, admins.role);

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admins.id,
        username: admins.username,
        email: admins.email,
        role: admins.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// Verify Token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(403).json({ valid: false, message: 'Invalid token' });
  }
});

// Delete Self (Admin Deletes Own Account)
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { error } = await supabase.from('admins').delete().eq('id', adminId);
    if (error) throw error;
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
