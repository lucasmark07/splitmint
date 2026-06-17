const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/init');

router.post('/signup', (req, res) => {
  const { name, email, password, upi_id } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password required' });
  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, upi_id) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashed, upi_id || '');
    const token = jwt.sign({ user_id: result.lastInsertRowid }, process.env.JWT_SECRET);
    res.json({ token, user_id: result.lastInsertRowid, name, email });
  } catch {
    res.status(400).json({ error: 'Email already registered' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).json({ error: 'Wrong password' });
  const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);
  res.json({ token, user_id: user.user_id, name: user.name });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'No account with this email' });

  // Generate token
  const token  = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + 1000 * 60 * 30; // 30 minutes

  db.prepare(
    'UPDATE users SET reset_token = ?, reset_expiry = ? WHERE email = ?'
  ).run(token, expiry, email);

  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"SplitMint 💸" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your SplitMint password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;color:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:#14532d;padding:24px;text-align:center;">
            <h1 style="color:#4ade80;margin:0;">💸 SplitMint</h1>
            <p style="color:#86efac;margin:8px 0 0;">Password Reset</p>
          </div>
          <div style="padding:24px;">
            <p>Hey <strong>${user.name}</strong> 👋</p>
            <p style="color:#aaa;">We received a request to reset your password. Click the button below:</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetLink}"
                style="background:#4ade80;color:#000;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">
                Reset Password
              </a>
            </div>
            <p style="color:#555;font-size:13px;">This link expires in <strong>30 minutes</strong>.</p>
            <p style="color:#555;font-size:13px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });
    res.json({ message: 'Reset link sent to your email' });
  } catch {
    res.status(500).json({ error: 'Failed to send email. Check EMAIL config in .env' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: 'Token and password required' });

  const user = db.prepare(
    'SELECT * FROM users WHERE reset_token = ?'
  ).get(token);

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });
  if (Date.now() > user.reset_expiry)
    return res.status(400).json({ error: 'Reset link has expired. Request a new one.' });

  const hashed = bcrypt.hashSync(password, 10);
  db.prepare(
    'UPDATE users SET password = ?, reset_token = "", reset_expiry = 0 WHERE user_id = ?'
  ).run(hashed, user.user_id);

  res.json({ message: 'Password reset successfully ✅' });
});

module.exports = router;