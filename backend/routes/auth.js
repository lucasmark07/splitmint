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

module.exports = router;