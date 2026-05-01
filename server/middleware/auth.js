const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Real-time security check: ensure admin still exists and is not suspended
    const { data: admin, error } = await supabase
      .from('admins')
      .select('is_verified')
      .eq('id', decoded.id || decoded.userId)
      .single();

    if (error || !admin || !admin.is_verified) {
      return res.status(403).json({ message: 'Account is suspended, removed, or unverified. Please contact Super Admin.' });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
