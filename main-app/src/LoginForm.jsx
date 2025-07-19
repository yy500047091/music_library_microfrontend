// main-app/src/LoginForm.jsx
import React, { useState } from 'react';

const LoginForm = ({ onLogin, error }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(credentials);
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const quickLogin = (username, password) => {
    setCredentials({ username, password });
    onLogin({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          value={credentials.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Enter username..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={credentials.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="Enter password..."
          required
        />
      </div>

      <button type="submit" className="login-btn">
        🔑 Login
      </button>

      <div className="quick-login">
        <p>Quick Login:</p>
        <div className="quick-login-buttons">
          <button 
            type="button" 
            onClick={() => quickLogin('admin', 'admin123')}
            className="quick-btn admin-btn"
          >
            Login as Admin
          </button>
          <button 
            type="button" 
            onClick={() => quickLogin('user', 'user123')}
            className="quick-btn user-btn"
          >
            Login as User
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;