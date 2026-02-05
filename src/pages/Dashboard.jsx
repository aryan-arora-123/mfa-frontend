import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h1>Dashboard</h1>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
        <p className="muted">You are signed in as {user?.email}.</p>
        <div className="grid">
          <div className="panel">
            <h2>Multi-factor auth</h2>
            <p>MFA adds an extra layer of security to your account.</p>
            <Link to="/mfa" className="link-button">
              Manage MFA
            </Link>
          </div>
          <div className="panel">
            <h2>Active sessions</h2>
            <p>Review and revoke sessions across your devices.</p>
            <Link to="/sessions" className="link-button">
              View sessions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

