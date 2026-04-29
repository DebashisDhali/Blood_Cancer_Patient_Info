const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const supabase = require('../config/supabaseClient');
const { generateToken } = require('../utils/helpers');

// Register Admin
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
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

    // Insert new admin
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert([{ username, email, password_hash, role: 'admin' }])
      .select();

    if (insertError) throw insertError;
    if (!newAdmin || newAdmin.length === 0) {
      return res.status(500).json({ message: 'Failed to create admin' });
    }

    const admin = newAdmin[0];
    const token = generateToken(admin.id, admin.role);

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
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

    if (queryError) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admins) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, admins.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await supabase
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

module.exports = router;
