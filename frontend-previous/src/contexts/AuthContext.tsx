import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'company' | 'candidate' | 'vendor' | 'client';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate login logic
    const mockUser: User = {
      id: '1',
      name: 'User', // Generic name for now
      email,
      role,
    };
    setUser(mockUser);
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        role,
        name: role === 'company' ? 'HR Manager' : role === 'candidate' ? 'John Candidate' : role === 'vendor' ? 'Vendor Partner' : 'Client User',
      };
      setUser(updatedUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    updateUserRole,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};