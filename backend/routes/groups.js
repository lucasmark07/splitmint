const express = require('express');
const router = express.Router();
const db = require('../db/init');
const auth = require('../middleware/auth');

router.post('/', auth, (req, res) => {
  const { group_name } = req.body;
  if (!group_name) return res.status(400).json({ error: 'Group name required' });
  const result = db.prepare(
    'INSERT INTO groups_table (group_name, created_by) VALUES (?, ?)'
  ).run(group_name, req.user.user_id);
  db.prepare(
    'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)'
  ).run(result.lastInsertRowid, req.user.user_id);
  res.json({ group_id: result.lastInsertRowid, group_name });
});

router.get('/', auth, (req, res) => {
  const groups = db.prepare(`
    SELECT g.* FROM groups_table g
    JOIN group_members gm ON g.group_id = gm.group_id
    WHERE gm.user_id = ?
  `).all(req.user.user_id);
  res.json(groups);
});

router.post('/:id/members', auth, (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  db.prepare(
    'INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)'
  ).run(req.params.id, user.user_id);
  res.json({ message: `${user.name} added to group` });
});

module.exports = router;