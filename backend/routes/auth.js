const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// Forgot password: request reset token and send email
router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
  db.prepare('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.user_id, expiresAt.toISOString());
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@example.com',
        to: email,
        subject: 'Password reset',
        text: `Reset your password: ${resetUrl}`,
        html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
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