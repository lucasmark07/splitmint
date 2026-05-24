import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState('');
  const [error, setError] = useState('');

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
      await api.post('/groups', { group_name: newGroup });
      setNewGroup('');
      fetchGroups();
    } catch { setError('Failed to create group'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>💸 SplitMint</h1>
        <div style={styles.userInfo}>
          <span style={styles.welcome}>Hey, {user?.name} 👋</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Your Groups</h2>

        <div style={styles.createGroup}>
          <input style={styles.input} placeholder="Group name (e.g. Chandigarh Trip)"
            value={newGroup} onChange={e => setNewGroup(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createGroup()} />
          <button style={styles.btn} onClick={createGroup}>+ Create</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.groupList}>
          {groups.length === 0 && (
            <p style={styles.empty}>No groups yet. Create one above ☝️</p>
          )}
          {groups.map(g => (
            <div key={g.group_id} style={styles.groupCard}
              onClick={() => navigate(`/group/${g.group_id}`)}>
              <span style={styles.groupIcon}>👥</span>
              <div>
                <p style={styles.groupName}>{g.group_name}</p>
                <p style={styles.groupSub}>Tap to view expenses</p>
              </div>
              <span style={styles.arrow}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f0f', color: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid #222' },
  logo: { color: '#4ade80', margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#aaa', fontSize: '14px' },
  logoutBtn: { padding: '8px 16px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #333', cursor: 'pointer' },
  content: { maxWidth: '600px', margin: '0 auto', padding: '32px 16px' },
  sectionTitle: { color: '#fff', marginBottom: '16px' },
  createGroup: { display: 'flex', gap: '8px', marginBottom: '24px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '14px' },
  btn: { padding: '12px 20px', borderRadius: '8px', background: '#4ade80', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
  error: { color: '#f87171' },
  groupList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  empty: { color: '#555', textAlign: 'center', padding: '40px 0' },
  groupCard: { display: 'flex', alignItems: 'center', gap: '16px', background: '#1a1a1a', padding: '16px 20px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #222' },
  groupIcon: { fontSize: '24px' },
  groupName: { color: '#fff', margin: 0, fontWeight: 'bold' },
  groupSub: { color: '#555', margin: 0, fontSize: '12px' },
  arrow: { marginLeft: 'auto', color: '#555', fontSize: '24px' },
};