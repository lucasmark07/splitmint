import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Button, Card, Modal, Input, TabButton, Badge, Chip } from '../components/index.jsx';

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
      await api.post(`/groups/${selectedGroupId}/members`, { email: memberEmail });
      setMemberEmail('');
      fetchGroupMembers();
    } catch { setError('Failed to add member'); }
  };

  const fetchGroupMembers = async () => {
    try {
      const res = await api.get(`/groups/${selectedGroupId}/members`);
      setGroupMembers(res.data);
    } catch { setError('Failed to load members'); }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-400">💸 SplitMint</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Hi, {user?.name} 👋</span>
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
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Create Group Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Groups</h2>
            <Button onClick={() => setShowCreateModal(true)}>
              + New Group
            </Button>
          </div>

          {error && (
            <Card className="bg-red-900 border-red-700 mb-6">
              <p className="text-red-100">{error}</p>
            </Card>
          )}

          {/* Groups Grid */}
          {groups.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-400 mb-4">No groups yet. Create one to get started!</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Group
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <Card
                  key={group.group_id}
                  className="cursor-pointer hover:border-primary-500 transition-colors"
                  onClick={() => navigate(`/group/${group.group_id}`)}
                >
                  <h3 className="text-xl font-bold text-white mb-4">{group.group_name}</h3>
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <p>Created: {new Date(group.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Details →
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
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
            Create
          </Button>
        </div>
      </Modal>

      {/* Add Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => { setShowMembersModal(false); setGroupMembers([]); }}
        title="Add Members to Group"
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
            <h4 className="text-sm font-medium text-gray-300 mb-2">Added Members:</h4>
            <div className="space-y-2">
              {groupMembers.map(member => (
                <div key={member.user_id} className="bg-gray-800 rounded px-3 py-2 text-sm text-gray-200">
                  {member.name} ({member.email})
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
