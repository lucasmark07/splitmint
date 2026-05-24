import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Group() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [members, setMembers] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', split_among: [] });
  const [memberEmail, setMemberEmail] = useState('');
  const [tab, setTab] = useState('expenses');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const [exp, bal] = await Promise.all([
      api.get(`/expenses/${id}`),
      api.get(`/balances/${id}`),
    ]);
    setExpenses(exp.data);
    setBalances(bal.data);
  };

  const addExpense = async () => {
    if (!form.description || !form.amount) return;
    const splitAmong = form.split_among.length > 0
      ? form.split_among
      : [Number(user.user_id)];
    await api.post('/expenses', {
      group_id: Number(id),
      amount: Number(form.amount),
      description: form.description,
      split_among: splitAmong,
    });
    setForm({ description: '', amount: '', split_among: [] });
    setShowAddExpense(false);
    fetchAll();
  };

  const addMember = async () => {
    await api.post(`/groups/${id}/members`, { email: memberEmail });
    setMemberEmail('');
    setShowAddMember(false);
  };

  const openUPI = (debt) => {
    if (!debt.to_upi) { alert(`${debt.to_name} has no UPI ID registered`); return; }
    const link = `upi://pay?pa=${debt.to_upi}&pn=${debt.to_name}&am=${debt.amount}&cu=INR&tn=SplitMint`;
    window.location.href = link;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={styles.title}>Group #{id}</h2>
        <button style={styles.addMemberBtn} onClick={() => setShowAddMember(!showAddMember)}>+ Member</button>
      </div>

      {showAddMember && (
        <div style={styles.modal}>
          <input style={styles.input} placeholder="Friend's email"
            value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
          <button style={styles.btn} onClick={addMember}>Add</button>
        </div>
      )}

      <div style={styles.tabs}>
        <button style={tab === 'expenses' ? styles.activeTab : styles.tab} onClick={() => setTab('expenses')}>Expenses</button>
        <button style={tab === 'balances' ? styles.activeTab : styles.tab} onClick={() => setTab('balances')}>Balances</button>
      </div>

      <div style={styles.content}>
        {tab === 'expenses' && (
          <>
            <button style={styles.addBtn} onClick={() => setShowAddExpense(!showAddExpense)}>
              {showAddExpense ? 'Cancel' : '+ Add Expense'}
            </button>

            {showAddExpense && (
              <div style={styles.formCard}>
                <input style={styles.input} placeholder="Description (e.g. Dinner)"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                <input style={styles.input} type="number" placeholder="Amount (₹)"
                  value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                <p style={styles.hint}>Split among: you only (add members to split with others)</p>
                <button style={styles.btn} onClick={addExpense}>Add Expense</button>
              </div>
            )}

            {expenses.length === 0 && <p style={styles.empty}>No expenses yet</p>}
            {expenses.map(e => (
              <div key={e.expense_id} style={styles.card}>
                <div>
                  <p style={styles.cardTitle}>{e.description}</p>
                  <p style={styles.cardSub}>Paid by {e.paid_by_name}</p>
                </div>
                <p style={styles.amount}>₹{e.amount}</p>
              </div>
            ))}
          </>
        )}

        {tab === 'balances' && (
          <>
            {balances.length === 0 && <p style={styles.empty}>✅ All settled up!</p>}
            {balances.map((b, i) => (
              <div key={i} style={styles.card}>
                <div>
                  <p style={styles.cardTitle}>{b.from_name} owes {b.to_name}</p>
                  <p style={styles.cardSub}>₹{b.amount}</p>
                </div>
                <button style={styles.upiBtn} onClick={() => openUPI(b)}>
                  Pay via UPI
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f0f', color: '#fff' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #222' },
  back: { background: 'none', color: '#4ade80', border: 'none', cursor: 'pointer', fontSize: '16px' },
  title: { color: '#fff', margin: 0 },
  addMemberBtn: { padding: '8px 14px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #333', cursor: 'pointer' },
  modal: { display: 'flex', gap: '8px', padding: '12px 20px', background: '#1a1a1a', borderBottom: '1px solid #222' },
  tabs: { display: 'flex', borderBottom: '1px solid #222' },
  tab: { flex: 1, padding: '14px', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '15px' },
  activeTab: { flex: 1, padding: '14px', background: 'none', border: 'none', borderBottom: '2px solid #4ade80', color: '#4ade80', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  content: { maxWidth: '600px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  addBtn: { padding: '12px', borderRadius: '8px', background: '#4ade80', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  formCard: { background: '#1a1a1a', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', fontSize: '14px' },
  btn: { padding: '12px', borderRadius: '8px', background: '#4ade80', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
  hint: { color: '#555', fontSize: '12px', margin: 0 },
  empty: { color: '#555', textAlign: 'center', padding: '40px 0' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '16px', borderRadius: '12px', border: '1px solid #222' },
  cardTitle: { color: '#fff', margin: 0, fontWeight: 'bold' },
  cardSub: { color: '#555', margin: 0, fontSize: '12px' },
  amount: { color: '#4ade80', fontWeight: 'bold', fontSize: '18px', margin: 0 },
  upiBtn: { padding: '8px 14px', borderRadius: '8px', background: '#4ade80', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
};