import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('omni_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const isAuthenticated = !!user;

  const login = (userData) => {
    localStorage.setItem('token', userData.access_token);
    const userInfo = { id: userData.user_id, username: userData.username };
    localStorage.setItem('omni_user', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('omni_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
