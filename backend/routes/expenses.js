const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

router.post('/', auth, (req, res) => {
  const { group_id, amount, description, split_among } = req.body;
  if (!group_id || !amount || !description || !split_among)
    return res.status(400).json({ error: 'All fields required' });
  const result = db.prepare(
    'INSERT INTO expenses (group_id, paid_by, amount, description) VALUES (?, ?, ?, ?)'
  ).run(group_id, req.user.user_id, amount, description);
  const share = amount / split_among.length;
  const insertSplit = db.prepare(
    'INSERT INTO expense_splits (expense_id, user_id, share) VALUES (?, ?, ?)'
  );
  split_among.forEach(uid => insertSplit.run(result.lastInsertRowid, uid, share));
  res.json({ expense_id: result.lastInsertRowid, message: 'Expense added ✅' });
});

router.get('/:groupId', auth, (req, res) => {
  const expenses = db.prepare(`
    SELECT e.*, u.name as paid_by_name FROM expenses e
    JOIN users u ON e.paid_by = u.user_id
    WHERE e.group_id = ? ORDER BY e.created_at DESC
  `).all(req.params.groupId);
  res.json(expenses);
});

module.exports = router;