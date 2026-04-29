const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.slice(0, 3) + 'XXX' + phone.slice(6);
};

const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return '*' + domain;
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] + '@' + domain;
};

module.exports = { generateToken, maskPhoneNumber, maskEmail };
