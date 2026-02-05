import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const MFAVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const mfaToken = location.state?.mfaToken;
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!mfaToken) {
    return (
      <div className="page">
        <div className="card">
          <h1>MFA verification</h1>
          <p className="error">
            Missing MFA token. Please log in again.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/mfa/verify-login', {
        mfaToken,
        otp,
      });
      loginWithTokens(res.data.accessToken, res.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Enter your OTP</h1>
        <p className="muted">
          {email
            ? `Enter the 6-digit code from your authenticator app for ${email}.`
            : 'Enter the 6-digit code from your authenticator app.'}
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            One-time password
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default MFAVerify;

