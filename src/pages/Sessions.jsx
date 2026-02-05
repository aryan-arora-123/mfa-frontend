import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Sessions = () => {
  const { logoutAll } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const revoke = async (id) => {
    try {
      await api.post(`/sessions/revoke/${id}`);
      await loadSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    await logoutAll();
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h1>Active sessions</h1>
          <button className="ghost" onClick={handleLogoutAll}>
            Logout from all devices
          </button>
        </div>
        <p className="muted">
          These are the devices currently signed in to your account.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : sessions.length === 0 ? (
          <p>No active sessions.</p>
        ) : (
          <ul className="sessions-list">
            {sessions.map((s) => (
              <li key={s.id} className="session-item">
                <div>
                  <strong>{s.deviceName || 'Unknown device'}</strong>
                  <p className="muted">
                    IP: {s.ip || 'N/A'} • User agent: {s.userAgent || 'N/A'}
                  </p>
                  <p className="muted">
                    Last used: {s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  {s.isCurrent && <span className="badge">Current</span>}
                  <button onClick={() => revoke(s.id)}>Revoke</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Sessions;

