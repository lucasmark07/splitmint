function calculateBalances(expenses, memberIds) {
  const net = {};
  memberIds.forEach(id => (net[id] = 0));

  expenses.forEach(exp => {
    if (!exp.splits || exp.splits.length === 0) return;
    const share = exp.amount / exp.splits.length;
    net[exp.paid_by] = (net[exp.paid_by] || 0) + exp.amount;
    exp.splits.forEach(uid => {
      net[uid] = (net[uid] || 0) - share;
    });
  });

  const debts = [];
  let creditors = Object.entries(net)
    .filter(([, v]) => v > 0.01)
    .map(([id, amt]) => ({ id: Number(id), amt }));
  let debtors = Object.entries(net)
    .filter(([, v]) => v < -0.01)
    .map(([id, amt]) => ({ id: Number(id), amt: Math.abs(amt) }));

  while (creditors.length && debtors.length) {
    const c = creditors[0];
    const d = debtors[0];
    const amount = Math.min(c.amt, d.amt);
    debts.push({ from: d.id, to: c.id, amount: Math.round(amount * 100) / 100 });
    c.amt -= amount;
    d.amt -= amount;
    if (c.amt < 0.01) creditors.shift();
    if (d.amt < 0.01) debtors.shift();
  }

  return debts;
}

module.exports = calculateBalances;