'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AccessRights, roleAccessMap, AccessLevel } from '@/types/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAccess: (feature: keyof AccessRights) => boolean | AccessLevel;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - in production, this would be in your backend
const MOCK_USERS: User[] = [
  { username: 'plant_head', password: 'password123', role: 'plant_head' },
  { username: 'operator', password: 'password123', role: 'operator' },
  { username: 'production_manager', password: 'password123', role: 'production_manager' },
  { username: 'engineer', password: 'password123', role: 'engineer' },
  { username: 'admin', password: 'password123', role: 'admin' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user in cookie
    const savedUser = Cookies.get('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user cookie:', e);
        Cookies.remove('user');
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Mock authentication - replace with actual API call in production
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setUser(user);
      // Set cookie with user data
      Cookies.set('user', JSON.stringify(user), { 
        expires: 7, // Cookie expires in 7 days
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
  };

  const checkAccess = (feature: keyof AccessRights): boolean | AccessLevel => {
    if (!user) return false;
    const rights = roleAccessMap[user.role];
    const access = rights[feature];
    
    if (feature === 'downtimeTracker' || feature === 'accountSettings') {
      return access as AccessLevel;
    }
    
    return access as boolean;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAccess }}>
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
