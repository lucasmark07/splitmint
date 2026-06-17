import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Button, Card, Modal, Input, TabButton, Badge, Chip } from '../components/index.jsx';

export default function Group() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState('Group');
  const [activeTab, setActiveTab] = useState('expenses');

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [memberEmail, setMemberEmail] = useState('');

  const [form, setForm] = useState({
    description: '',
    amount: '',
    paidBy: Number(user?.user_id) || null,
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user, id]);

  const fetchAll = async () => {
    try {
      const [exp, bal, mem, grp] = await Promise.all([
        api.get('/expenses/' + id),
        api.get('/balances/' + id),
        api.get('/groups/' + id + '/members'),
        api.get('/groups/' + id),
      ]);
      setExpenses(exp.data);
      setBalances(bal.data);
      setMembers(mem.data);
      if (grp.data && grp.data.group_name) setGroupName(grp.data.group_name);
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const addExpense = async () => {
    if (!form.description || !form.amount) return;

    const splitAmong = splitType === 'equal'
      ? (selectedMembers.length > 0 ? selectedMembers : [Number(user.user_id)])
      : Object.keys(customSplits).filter(id => Number(customSplits[id]) > 0).map(Number);

    try {
      await api.post('/expenses', {
        group_id: Number(id),
        amount: Number(form.amount),
        description: form.description,
        paid_by: form.paidBy,
        split_among: splitAmong,
      });

      setForm({ description: '', amount: '', paidBy: Number(user.user_id) });
      setSplitType('equal');
      setSelectedMembers([]);
      setCustomSplits({});
      setShowAddExpense(false);
      fetchAll();
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  const addMember = async () => {
    if (!memberEmail.trim()) return;
    try {
      await api.post('/groups/' + id + '/members', { email: memberEmail });
      setMemberEmail('');
      fetchAll();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const removeMember = async (memberId) => {
    try {
      await api.delete('/groups/' + id + '/members/' + memberId);
      fetchAll();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">{groupName}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowAddMember(true)}>
              + Add Member
            </Button>
            <Button size="sm" onClick={() => setShowAddExpense(true)}>
              + Add Expense
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="border-b border-border mb-8 flex gap-8 overflow-x-auto">
          <TabButton
            isActive={activeTab === 'expenses'}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </TabButton>
          <TabButton
            isActive={activeTab === 'balances'}
            onClick={() => setActiveTab('balances')}
          >
            Balances
          </TabButton>
          <TabButton
            isActive={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
          >
            Members ({members.length})
          </TabButton>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {expenses.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-400 mb-4">No expenses yet</p>
                <Button onClick={() => setShowAddExpense(true)}>
                  Add Your First Expense
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {expenses.map(exp => (
                  <Card key={exp.expense_id} className="hover:border-primary-500 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-lg">{exp.description}</h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(exp.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-400 text-xl">₹{exp.amount}</p>
                        <p className="text-gray-400 text-sm">Paid by {exp.payer_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Balances Tab */}
        {activeTab === 'balances' && (
          <div className="space-y-4">
            {balances.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-400">All settled up! 🎉</p>
              </Card>
            ) : (
              balances.map((bal, idx) => (
                <Card key={idx} className={bal.amount > 0 ? 'border-red-600' : 'border-green-600'}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{bal.user_name || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">{bal.description || 'Settlement'}</p>
                    </div>
                    <Badge variant={bal.amount > 0 ? 'danger' : 'success'}>
                      {bal.amount > 0 ? '₹' + Math.abs(bal.amount) : '₹' + Math.abs(bal.amount)}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => (
              <Card key={member.user_id} className="hover:border-primary-500 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white">{member.name}</h3>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                  {member.user_id !== user?.user_id && (
                    <button
                      onClick={() => removeMember(member.user_id)}
                      className="text-red-400 hover:text-red-300 text-xl leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
                {member.user_id === user?.user_id && (
                  <Badge variant="primary">You</Badge>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddExpense}
        onClose={() => {
          setShowAddExpense(false);
          setSplitType('equal');
          setSelectedMembers([]);
          setCustomSplits({});
        }}
        title="Add Expense"
      >
        <Input
          label="Description"
          placeholder="e.g. Restaurant bill"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <Input
          label="Amount (₹)"
          type="number"
          placeholder="0.00"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
        />

        {/* Split Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">Split Type</label>
          <div className="space-y-2">
            {['equal', 'custom', 'manual'].map(type => (
              <label key={type} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  checked={splitType === type}
                  onChange={e => setSplitType(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-gray-200 capitalize">{type} Split</span>
              </label>
            ))}
          </div>
        </div>

        {/* Members Selection */}
        {(splitType === 'equal' || splitType === 'custom') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Members
            </label>
            <div className="space-y-2 bg-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto">
              {members.map(member => (
                <label key={member.user_id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.user_id)}
                    onChange={() => toggleMember(member.user_id)}
                    className="cursor-pointer"
                  />
                  <span className="text-gray-200">{member.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Manual Splits */}
        {splitType === 'manual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Amount per member (₹)
            </label>
            <div className="space-y-3 bg-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto">
              {members.map(member => (
                <div key={member.user_id} className="flex items-center gap-2">
                  <span className="text-gray-300 flex-1">{member.name}</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={customSplits[member.user_id] || ''}
                    onChange={e => setCustomSplits({
                      ...customSplits,
                      [member.user_id]: e.target.value
                    })}
                    className="w-24 bg-gray-700 border border-border rounded px-2 py-1 text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddExpense(false);
              setSplitType('equal');
              setSelectedMembers([]);
              setCustomSplits({});
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={addExpense} className="flex-1">
            Add Expense
          </Button>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => { setShowAddMember(false); setMemberEmail(''); }}
        title="Add Member"
      >
        <Input
          label="Email Address"
          type="email"
          placeholder="friend@example.com"
          value={memberEmail}
          onChange={e => setMemberEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMember()}
        />

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => { setShowAddMember(false); setMemberEmail(''); }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={addMember} className="flex-1">
            Add
          </Button>
        </div>
      </Modal>
    </div>
  );
}
