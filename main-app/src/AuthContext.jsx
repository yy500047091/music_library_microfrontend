import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: () => false
});

export default AuthContext;