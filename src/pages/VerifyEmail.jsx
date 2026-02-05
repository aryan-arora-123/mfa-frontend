import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending'); // pending | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const run = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token');
        return;
      }
      try {
        const res = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(res.data.message || 'Email verified. You can now log in.');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Email verification failed.'
        );
      }
    };
    run();
  }, [searchParams]);

  return (
    <div className="page">
      <div className="card">
        <h1>Email verification</h1>
        <p className={status === 'success' ? 'success' : 'error'}>
          {message}
        </p>
        <p className="muted">
          Continue to <Link to="/login">login</Link>.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

