import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('cashsense_token');
    const savedUser = localStorage.getItem('cashsense_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email || !password) {
      setIsLoading(false);
      throw new Error('Please fill in all credentials.');
    }

    // Mock validation
    const mockUser: User = {
      firstName: 'Karan',
      lastName: 'Sharma',
      email: email,
      isVerified: true, // Default login user is verified
    };

    const mockToken = 'mock-jwt-token-xyz';
    localStorage.setItem('cashsense_token', mockToken);
    localStorage.setItem('cashsense_user', JSON.stringify(mockUser));
    
    setToken(mockToken);
    setUser(mockUser);
    setIsLoading(false);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!firstName || !lastName || !email || !password) {
      setIsLoading(false);
      throw new Error('Please fill in all registration fields.');
    }

    const mockUser: User = {
      firstName,
      lastName,
      email,
      isVerified: false, // New registration must verify email
    };

    const mockToken = 'mock-jwt-token-pending-verification';
    localStorage.setItem('cashsense_token', mockToken);
    localStorage.setItem('cashsense_user', JSON.stringify(mockUser));

    setToken(mockToken);
    setUser(mockUser);
    setIsLoading(false);
  };

  const verifyEmail = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (user) {
      const verifiedUser = { ...user, isVerified: true };
      const verifiedToken = 'mock-jwt-token-verified-abc';
      localStorage.setItem('cashsense_token', verifiedToken);
      localStorage.setItem('cashsense_user', JSON.stringify(verifiedUser));
      
      setToken(verifiedToken);
      setUser(verifiedUser);
    }
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('cashsense_token');
    localStorage.removeItem('cashsense_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
