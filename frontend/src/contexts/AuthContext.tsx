import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'student' | 'professor') => Promise<void>;
  logout: () => void;
}

// Used when the backend isn't running, so the mock-data demo still works
function demoUser(email: string, name?: string, role?: 'student' | 'professor'): User {
  const resolvedRole = role ?? (email.toLowerCase().includes('prof') ? 'professor' : 'student');
  return {
    id: resolvedRole === 'professor' ? 'prof-001' : 'student-001',
    email,
    name: name ?? (resolvedRole === 'professor' ? 'Demo Professor' : 'Demo Student'),
    role: resolvedRole,
  };
}

function isNetworkError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && !('response' in error && (error as { response?: unknown }).response);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const persist = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    let response;
    try {
      response = await api.post('/api/auth/login', { email, password }, { timeout: 3000 });
    } catch (error) {
      if (isNetworkError(error)) return persist(demoUser(email), 'demo-token');
      throw error;
    }
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(user);
  };

  const register = async (email: string, password: string, name: string, role: 'student' | 'professor') => {
    let response;
    try {
      response = await api.post('/api/auth/register', { email, password, name, role }, { timeout: 3000 });
    } catch (error) {
      if (isNetworkError(error)) return persist(demoUser(email, name, role), 'demo-token');
      throw error;
    }
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
