import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onLogin, error }) => {
  const [credentials, setCredentials] = useState({
    user: '',  // Changed from username to user
    password: '',
    role: 'user'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!credentials.user || !credentials.password) {  // Changed from username to user
      onLogin({ error: 'Email and password are required' });
      return;
    }
    onLogin(credentials);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const quickLogin = (role) => {
    const demoAccounts = {
      admin: { 
        user: 'admin@musicapp.com',  // Changed from username to user
        password: 'SecureAdmin@123', 
        role: 'admin' 
      },
      user: { 
        user: 'user@musicapp.com',  // Changed from username to user
        password: 'MusicLover@456', 
        role: 'user' 
      },
      guest: {
        user: 'guest@musicapp.com',  // Changed from username to user
        password: 'ListenOnly@789',
        role: 'guest'
      }
    };
    const account = demoAccounts[role];
    if (account) {
      setCredentials(account);
      onLogin(account);
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="user"  // Changed from username to user
            value={credentials.user}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            required
            minLength="8"
          />
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={credentials.role}
            onChange={handleInputChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
        </div>
        
        <button type="submit">Login</button>
        
        <div className="demo-buttons">
          <button type="button" onClick={() => quickLogin('admin')}>
            Demo Admin
          </button>
          <button type="button" onClick={() => quickLogin('user')}>
            Demo User
          </button>
          <button type="button" onClick={() => quickLogin('guest')}>
            Demo Guest
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;