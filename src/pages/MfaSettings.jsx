import { useEffect, useState } from 'react';
import api from '../api/client';

const MfaSettings = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ enabled: false, hasBackupCodes: false });
  const [setup, setSetup] = useState(null);
  const [otp, setOtp] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [disableOtp, setDisableOtp] = useState('');
  const [disableBackup, setDisableBackup] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mfa/status');
      setStatus({ enabled: res.data.enabled, hasBackupCodes: res.data.hasBackupCodes });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load MFA status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const startSetup = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/mfa/setup');
      setSetup(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start MFA setup');
    }
  };

  const verifySetup = async (e) => {
    e.preventDefault();
    if (!setup?.secretId) return;
    setError('');
    setMessage('');
    try {
      const res = await api.post('/mfa/verify-setup', {
        secretId: setup.secretId,
        otp,
      });
      setBackupCodes(res.data.backupCodes || []);
      setSetup(null);
      setOtp('');
      setMessage('MFA enabled successfully. Save your backup codes somewhere safe.');
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify setup');
    }
  };

  const disableMfa = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/mfa/disable', {
        otp: disableOtp || undefined,
        backupCode: disableBackup || undefined,
      });
      setDisableOtp('');
      setDisableBackup('');
      setBackupCodes([]);
      setMessage('MFA disabled.');
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable MFA');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Multi-factor authentication</h1>
        <p className="muted">
          Protect your account with a time-based one-time password (TOTP) from an authenticator app.
        </p>

        {status.enabled ? (
          <>
            <p className="success">MFA is currently enabled on your account.</p>
            <form onSubmit={disableMfa} className="form">
              <h2>Disable MFA</h2>
              <p className="muted">
                To disable MFA, enter a valid OTP from your authenticator app or one of your backup
                codes.
              </p>
              <label>
                OTP
                <input
                  type="text"
                  value={disableOtp}
                  onChange={(e) => setDisableOtp(e.target.value)}
                />
              </label>
              <label>
                Backup code
                <input
                  type="text"
                  value={disableBackup}
                  onChange={(e) => setDisableBackup(e.target.value)}
                />
              </label>
              <button type="submit">Disable MFA</button>
            </form>
          </>
        ) : (
          <>
            <p className="error">MFA is not enabled.</p>
            {!setup ? (
              <button onClick={startSetup}>Enable MFA</button>
            ) : (
              <div className="mfa-setup">
                <h2>Scan QR code</h2>
                <p className="muted">
                  Scan this QR code in Google Authenticator, Microsoft Authenticator, or another TOTP app.
                </p>
                <img
                  src={setup.qrCodeDataUrl}
                  alt="MFA QR code"
                  className="qr"
                />
                <p className="muted">
                  Or enter this key manually: <code>{setup.manualKey}</code>
                </p>
                <form onSubmit={verifySetup} className="form">
                  <label>
                    OTP from authenticator
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </label>
                  <button type="submit">Verify and enable</button>
                </form>
              </div>
            )}
          </>
        )}

        {backupCodes.length > 0 && (
          <div className="backup-codes">
            <h2>Backup codes</h2>
            <p className="muted">
              Each code can be used once if you lose access to your authenticator app. Store them securely.
            </p>
            <ul>
              {backupCodes.map((code) => (
                <li key={code}>
                  <code>{code}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default MfaSettings;

