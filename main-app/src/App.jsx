// main-app/src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import AuthContext from './AuthContext';
import LoginForm from './LoginForm';
import './App.css';

// Lazy load the micro frontend
const MusicLibrary = lazy(() => import('musicLibrary/MusicLibrary'));

// Mock JWT utility functions
const createMockJWT = (user) => {
  const payload = {
    username: user.username,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    iat: Date.now()
  };
  
  // In a real app, this would be properly signed
  return btoa(JSON.stringify(payload));
};

const decodeMockJWT = (token) => {
  try {
    const payload = JSON.parse(atob(token));
    
    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return {
      username: payload.username,
      role: payload.role
    };
  } catch (error) {
    return null;
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('musicAppToken');
    if (token) {
      const userData = decodeMockJWT(token);
      if (userData) {
        setUser(userData);
      } else {
        localStorage.removeItem('musicAppToken');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (credentials) => {
    setAuthError('');
    
    // Mock user database
    const users = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' }
    ];

    const foundUser = users.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (foundUser) {
      const token = createMockJWT(foundUser);
      localStorage.setItem('musicAppToken', token);
      
      setUser({
        username: foundUser.username,
        role: foundUser.role
      });
    } else {
      setAuthError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('musicAppToken');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Music Library...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>🎵 Music Library App</h1>
            <p className="header-subtitle">Micro Frontend Architecture Demo</p>
            
            {user && (
              <div className="header-actions">
                <span className="welcome-text">
                  Welcome, {user.username}!
                </span>
                <span className={`role-badge role-${user.role}`}>
                  {user.role.toUpperCase()}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="app-main">
          {!user ? (
            <div className="auth-container">
              <div className="auth-card">
                <h2>🔐 Please Login</h2>
                <p className="auth-description">
                  Access your music library with your credentials
                </p>
                
                <LoginForm onLogin={handleLogin} error={authError} />
                
                <div className="demo-credentials">
                  <h3>Demo Credentials:</h3>
                  <div className="credentials-grid">
                    <div className="credential-item">
                      <strong>Admin:</strong>
                      <br />
                      Username: admin
                      <br />
                      Password: admin123
                    </div>
                    <div className="credential-item">
                      <strong>User:</strong>
                      <br />
                      Username: user
                      <br />
                      Password: user123
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Render the Music Library micro frontend directly here
            <div className="music-library-container">
              <Suspense fallback={
                <div className="micro-frontend-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading Music Library Micro Frontend...</p>
                </div>
              }>
                <MusicLibrary user={user} />
              </Suspense>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>
            Built with React + Micro Frontend Architecture | 
            {user ? ` Logged in as ${user.username} (${user.role})` : ' Please login to continue'}
          </p>
        </footer>
      </div>
    </AuthContext.Provider>
  );
};

export default App;