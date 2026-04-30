const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
  });

  let apiUrl = process.env.API_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000');
  // Clean trailing slash
  apiUrl = apiUrl.replace(/\/+$/, '');
  const url = `${apiUrl}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Cancer Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Action Required: Verify Your Admin Account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Welcome to Admin Team!</h2>
        <p>Please verify your email to activate your administrator account.</p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify My Account</a>
        <p style="margin-top: 20px; font-size: 0.8rem; color: #666;">If the button doesn't work, copy and paste this link: <br/> ${url}</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
