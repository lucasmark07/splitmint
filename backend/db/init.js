const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database/splitmint.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    UNIQUE NOT NULL,
    password  TEXT    NOT NULL,
    upi_id    TEXT    DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS groups_table (
    group_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT    NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
  );

  CREATE TABLE IF NOT EXISTS group_members (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id  INTEGER NOT NULL,
    user_id   INTEGER NOT NULL,
    UNIQUE(group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups_table(group_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    expense_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id    INTEGER NOT NULL,
    paid_by     INTEGER NOT NULL,
    amount      REAL    NOT NULL,
    description TEXT    NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups_table(group_id),
    FOREIGN KEY (paid_by)  REFERENCES users(user_id)
  );

  CREATE TABLE IF NOT EXISTS expense_splits (
    split_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    share      REAL    NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id),
    FOREIGN KEY (user_id)    REFERENCES users(user_id)
  );

  CREATE TABLE IF NOT EXISTS settlements (
    settlement_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    payer_id        INTEGER NOT NULL,
    receiver_id     INTEGER NOT NULL,
    amount          REAL    NOT NULL,
    group_id        INTEGER NOT NULL,
    settlement_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Database initialized');
module.exports = db;