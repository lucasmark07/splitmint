const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db/init');

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

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

// Forgot password: request reset token and send email
router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
  db.prepare('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.user_id, expiresAt.toISOString());
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  try {
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.EMAIL_USER || 'no-reply@example.com',
        to: email,
        subject: 'Reset your password',
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
                <a href="${resetUrl}"
                  style="background:#4ade80;color:#000;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">
                  Reset Password
                </a>
              </div>
              <p style="color:#555;font-size:13px;">This link expires in <strong>1 hour</strong>.</p>
              <p style="color:#555;font-size:13px;">If you didn't request this, ignore this email.</p>
            </div>
          </div>
        `,
      });
    } else {
      console.log('Password reset token (no SMTP configured):', resetUrl);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Error sending reset email', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset password using token
router.post('/reset', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  const row = db.prepare('SELECT * FROM password_resets WHERE token = ?').get(token);
  if (!row) return res.status(400).json({ error: 'Invalid or expired token' });
  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM password_resets WHERE token = ?').run(token);
    return res.status(400).json({ error: 'Token expired' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password = ? WHERE user_id = ?').run(hashed, row.user_id);
  db.prepare('DELETE FROM password_resets WHERE token = ?').run(token);
  res.json({ ok: true });
});

module.exports = router;
