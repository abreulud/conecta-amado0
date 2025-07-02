import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';

export const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);

    Accounts.resetPassword(token, newPassword, err => {
      setIsLoading(false);
      if (err) {
        setError(err.reason);
      } else {
        setMessage('Password reset successfully!');
        setTimeout(() => navigate('/login'), 2000);
      }
    });
  };

  return (
    <div className="auth-form">
      <h2>Set New Password</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Set New Password'}
        </button>
      </form>
    </div>
  );
};
