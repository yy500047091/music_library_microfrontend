import React, { useState, useEffect } from 'react';
import MusicLibrary from './MusicLibrary';
import './MusicLibrary.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try to get user from localStorage (compatible with main app)
    const token = localStorage.getItem('musicAppToken');
    
    if (token) {
      try {
        // Decode the mock JWT (same as main app)
        const payload = JSON.parse(atob(token));
        
        // Check if token is expired
        if (payload.exp && payload.exp > Date.now()) {
          setUser({
            username: payload.username,
            role: payload.role
          });
          return;
        }
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    }

    // Fallback mock user for standalone development
    setUser({
      username: 'dev-user',
      role: 'admin' // Default to admin for development
    });
  }, []);

  if (!user) {
    return <div className="loading">Loading user data...</div>;
  }

  return (
    <div className="App">
      <h1>Music Library Micro Frontend - Standalone</h1>
      <div className="user-info">
        Logged in as: {user.username} ({user.role})
      </div>
      <MusicLibrary userRole={user.role} />
    </div>
  );
}

export default App;