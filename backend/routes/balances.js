const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');
const calculateBalances = require('../utils/calculateBalances');

router.get('/:groupId', auth, (req, res) => {
  const groupId = req.params.groupId;
  const expenses = db.prepare('SELECT * FROM expenses WHERE group_id = ?').all(groupId);
  expenses.forEach(exp => {
    exp.splits = db.prepare(
      'SELECT user_id FROM expense_splits WHERE expense_id = ?'
    ).all(exp.expense_id).map(r => r.user_id);
  });
  const members = db.prepare(
    'SELECT user_id FROM group_members WHERE group_id = ?'
  ).all(groupId).map(r => r.user_id);
  const debts = calculateBalances(expenses, members);
  const enriched = debts.map(d => {
    const from = db.prepare('SELECT name, upi_id FROM users WHERE user_id = ?').get(d.from);
    const to   = db.prepare('SELECT name, upi_id FROM users WHERE user_id = ?').get(d.to);
    return { ...d, from_name: from?.name, to_name: to?.name, to_upi: to?.upi_id };
  });
  res.json(enriched);
});

module.exports = router;