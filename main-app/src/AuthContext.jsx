// main-app/src/AuthContext.js
import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {}
});

export default AuthContext;