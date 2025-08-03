import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginRequest, LoginResponse, User } from '@/types';
import apiClient from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isMonitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isMonitor, setIsMonitor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedIsMonitor = localStorage.getItem('isMonitor');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsMonitor(storedIsMonitor === 'true');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/api/auth/login', credentials);
      const loginData: LoginResponse = response.data.data;

      setToken(loginData.token);
      setIsMonitor(loginData.isMonitor);
      
      // Create user object from login response
      const userData: User = {
        userId: 0, // Will be set from backend if needed
        email: loginData.email,
        role: loginData.role as 'ADMIN' | 'WARDEN' | 'STUDENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(userData);

      // Store in localStorage
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isMonitor', loginData.isMonitor.toString());

      toast({
        title: "Login Successful",
        description: `Welcome back, ${loginData.fullName || loginData.email}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsMonitor(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isMonitor');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    isMonitor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};