const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

router.post('/', auth, (req, res) => {
  const { receiver_id, amount, group_id } = req.body;
  db.prepare(
    'INSERT INTO settlements (payer_id, receiver_id, amount, group_id) VALUES (?, ?, ?, ?)'
  ).run(req.user.user_id, receiver_id, amount, group_id);
  res.json({ message: 'Settlement recorded ✅' });
});

router.get('/:groupId', auth, (req, res) => {
  const settlements = db.prepare(`
    SELECT s.*, p.name as payer_name, r.name as receiver_name
    FROM settlements s
    JOIN users p ON s.payer_id = p.user_id
    JOIN users r ON s.receiver_id = r.user_id
    WHERE s.group_id = ? ORDER BY s.settlement_date DESC
  `).all(req.params.groupId);
  res.json(settlements);
});

module.exports = router;