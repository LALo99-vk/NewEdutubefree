import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  setUser?: (user: User | null) => void;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Set the correct API URL to the backend server port (5000)
const API_URL = 'http://localhost:5000/api';

// Create a custom fetch function that automatically adds the auth token
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  return fetch(url, {
    ...options,
    headers
  });
};

// Admin credentials - these should be removed and handled by the backend
// const ADMIN_EMAIL = 'kishan05anand@gmail.com';
// const ADMIN_PASSWORD = 'Ki@7259107113';

// Password validation utility function
export const validatePassword = (password: string): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for minimum length
  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

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

  const login = async (email: string, password: string, role: 'user' | 'admin') => {
    setIsLoading(true);
    try {
      const response = await authFetch(`${API_URL}/users/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Login failed');
      }
      
      const data: AuthResponse = await response.json();
      
      // Verify the user has the requested role
      if (data.user.role !== role) {
        throw new Error(`You don't have ${role} privileges. Please contact the administrator.`);
      }
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      console.error('Login failed:', error);
        throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
    try {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(`Password doesn't meet security requirements: ${passwordValidation.issues[0]}`);
      }
      
      const response = await authFetch(`${API_URL}/users/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Registration failed');
      }
      
      const data: AuthResponse = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      console.error('Registration failed:', error);
        throw error;
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
        setUser,
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

// Export the authFetch function for use in other components
export { authFetch };