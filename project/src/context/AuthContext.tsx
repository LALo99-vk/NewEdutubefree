import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Set the correct API URL to the backend server port (5000)
const API_URL = 'http://localhost:5000/api';
// Flag to use mock auth when backend is unavailable
const USE_MOCK_AUTH = false; // Set to true to use mock auth when backend is unavailable

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth data in localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // You could also validate the token here by making a request to the backend
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (USE_MOCK_AUTH) {
        // Mock successful login (for testing without backend)
        console.log('Using mock auth for login:', email);
        const mockUser: User = {
          id: 'mock-user-id',
          name: email.split('@')[0],
          email,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Store mock data
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        return;
      }
      
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Login failed');
      }
      
      const data: AuthResponse = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      console.error('Login failed:', error);
      
      if (!USE_MOCK_AUTH) {
        throw error;
      } else {
        // If error occurs but mock auth is enabled, still create a mock user
        const mockUser: User = {
          id: 'mock-user-id',
          name: email.split('@')[0],
          email,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (USE_MOCK_AUTH) {
        // Mock successful registration (for testing without backend)
        console.log('Using mock auth for registration:', { name, email });
        const mockUser: User = {
          id: 'mock-user-id',
          name,
          email,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Store mock data
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        return;
      }
      
      // For troubleshooting, log the request
      console.log('Registration request:', { name, email, password: '***' });
      console.log('API URL:', `${API_URL}/users/register`);
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      // Log response status for debugging
      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error data:', errorData);
        throw new Error(errorData.msg || 'Registration failed');
      }
      
      const data: AuthResponse = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (!USE_MOCK_AUTH) {
        throw error;
      } else {
        // If error occurs but mock auth is enabled, still create a mock user
        const mockUser: User = {
          id: 'mock-user-id',
          name,
          email,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};