import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Button, Card, Modal, Input } from '../components/index.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState('');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch { setError('Failed to load groups'); }
  };

  const createGroup = async () => {
    if (!newGroup.trim()) return;
    try {
      const res = await api.post('/groups', { group_name: newGroup });
      setSelectedGroupId(res.data.group_id);
      setNewGroup('');
      setShowCreateModal(false);
      setShowMembersModal(true);
      fetchGroups();
    } catch { setError('Failed to create group'); }
  };

  const addMemberToGroup = async () => {
    if (!memberEmail.trim()) return;
    try {
      await api.post('/groups/' + selectedGroupId + '/members', { email: memberEmail });
      setMemberEmail('');
      fetchGroupMembers();
    } catch { setError('Failed to add member'); }
  };

  const fetchGroupMembers = async () => {
    try {
      const res = await api.get('/groups/' + selectedGroupId + '/members');
      setGroupMembers(res.data);
    } catch { setError('Failed to load members'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white bg-opacity-5 border-b border-white border-opacity-10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💸</span>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">SplitMint</h1>
              <p className="text-xs text-gray-400 font-semibold">Split Expenses Smartly</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => { logout(); navigate('/login'); }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-5xl font-black mb-2">
            <span className="text-white">Welcome back, </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
            <span className="text-white">!</span>
          </h2>
          <p className="text-gray-400 text-lg">Manage your group expenses with ease</p>
        </div>

        {/* Create Group Button */}
        <div className="mb-12 flex gap-4 items-center">
          <Button size="lg" onClick={() => setShowCreateModal(true)}>
            ✨ Create New Group
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/group/1')}>
            📊 View Statistics
          </Button>
        </div>

        {error && (
          <Card className="bg-red-500 bg-opacity-10 border-red-500 border-opacity-30 mb-6">
            <p className="text-red-200">{error}</p>
          </Card>
        )}

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <Card className="text-center py-16">
            <p className="text-gray-400 mb-6 text-lg">No groups yet. Create one to get started!</p>
            <Button size="lg" onClick={() => setShowCreateModal(true)}>
              Create Your First Group
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group, idx) => (
              <div key={group.group_id} style={{ animationDelay: `${idx * 100}ms` }} className="animate-fade-in-up cursor-pointer group">
                <Card 
                  className="h-full hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-400 hover:border-opacity-30 transform hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate('/group/' + group.group_id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-4xl mb-2">👥</div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{group.group_name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-400">
                      Created on {new Date(group.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Details →
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="✨ Create New Group"
      >
        <Input
          label="Group Name"
          placeholder="e.g. Summer Vacation"
          value={newGroup}
          onChange={e => setNewGroup(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createGroup()}
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={createGroup} className="flex-1">
            Create Group
          </Button>
        </div>
      </Modal>

      {/* Add Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => { setShowMembersModal(false); setGroupMembers([]); }}
        title="👥 Add Members"
      >
        <Input
          label="Member Email"
          type="email"
          placeholder="friend@example.com"
          value={memberEmail}
          onChange={e => setMemberEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMemberToGroup()}
        />

        {groupMembers.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Added Members:</h4>
            <div className="space-y-2">
              {groupMembers.map(member => (
                <div key={member.user_id} className="bg-white bg-opacity-5 rounded-lg px-4 py-3 text-sm text-gray-200 border border-white border-opacity-10">
                  👤 {member.name} 
                  <span className="text-gray-500 text-xs ml-2">({member.email})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => { setShowMembersModal(false); setGroupMembers([]); }} className="flex-1">
            Done
          </Button>
          <Button onClick={addMemberToGroup} className="flex-1">
            Add Member
          </Button>
        </div>
      </Modal>
    </div>
  );
}
