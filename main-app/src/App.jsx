import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import AuthContext from './AuthContext';
import LoginForm from './LoginForm';
import './App.css';

const MusicLibrary = lazy(() => import('musicLibrary/MusicLibrary')
  .catch(() => ({ default: () => <div>Failed to load Music Library</div> })));

const App = () => {
  const [authState, setAuthState] = useState({
    user: null,
    role: null,
    isLoading: true,
    error: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const savedAuth = localStorage.getItem('musicAppAuth');
    if (savedAuth) {
      try {
        const { user, role } = JSON.parse(savedAuth);
        setAuthState(prev => ({
          ...prev,
          user,
          role,
          isLoading: false
        }));
      } catch (error) {
        localStorage.removeItem('musicAppAuth');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);


  const handleLogin = useCallback((credentials) => {
    const users = [
      { user: 'admin@musicapp.com', password: 'SecureAdmin@123', role: 'admin' },
      { user: 'user@musicapp.com', password: 'MusicLover@456', role: 'user' },
      { user: 'guest@musicapp.com', password: 'ListenOnly@789', role: 'guest' }
    ];
  
    const foundUser = users.find(
      u => u.user === credentials.user && 
           u.password === credentials.password
    );
  
    if (foundUser) {
      // Save to localStorage with proper structure
      const authData = {
        user: foundUser.user,
        role: credentials.role // Get role from the form submission
      };
      localStorage.setItem('musicAppAuth', JSON.stringify(authData));
      
      setAuthState({
        user: foundUser.user,
        role: credentials.role, // Use the role from credentials
        isLoading: false,
        error: ''
      });
    } else {
      setAuthState(prev => ({
        ...prev,
        error: 'Invalid username or password'
      }));
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('musicAppAuth');
    setAuthState({
      user: null,
      role: null,
      isLoading: false,
      error: ''
    });
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!authState.user;
  }, [authState.user]);

  if (authState.isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      role: authState.role,
      login: handleLogin,
      logout: handleLogout,
      isAuthenticated
    }}>
      <div className="app">
        <header className="app-header">
          <h1>Music Library</h1>
          {authState.user && (
            <div className="user-info">
              <span>Welcome, {authState.user}</span>
              <span className={`role-badge ${authState.role}`}>
                {authState.role.toUpperCase()}
              </span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </header>

        <main className="app-main">
          {!authState.user ? (
            <LoginForm onLogin={handleLogin} error={authState.error} />
          ) : (

            
            <Suspense fallback={<div className="loading">Loading Player...</div>}>
              <MusicLibrary 
                userRole={authState.role}
                onAddSong={(song) => console.log('Add song:', song)}
                onDeleteSong={(id) => console.log('Delete song:', id)}
              />
            </Suspense>
          )}
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;