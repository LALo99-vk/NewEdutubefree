import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => void;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Set the correct API URL to the backend server port (5000)
const API_URL = 'http://localhost:5000/api';
// Flag to use mock auth when backend is unavailable
const USE_MOCK_AUTH = true; // Set to true to use mock auth when backend is unavailable

// Admin credentials
const ADMIN_EMAIL = 'kishan05anand@gmail.com';
const ADMIN_PASSWORD = 'Ki@7259107113';

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
      if (USE_MOCK_AUTH) {
        // For admin authentication, check against specific admin credentials
        if (role === 'admin') {
          if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            throw new Error('Invalid admin credentials. Access denied.');
          }
          
          // Admin authentication successful
          console.log('Admin authentication successful');
          const mockAdminUser: User = {
            id: 'admin-user-id',
            name: 'Administrator',
            email: ADMIN_EMAIL,
            role: 'admin',
            createdAt: new Date().toISOString()
          };
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Store mock data
          localStorage.setItem('token', 'mock-jwt-token-admin');
          localStorage.setItem('user', JSON.stringify(mockAdminUser));
          
          setUser(mockAdminUser);
          return;
        }
        
        // For user role or if role is not specified, use regular mock authentication
        console.log('Using mock auth for login:', email, 'as', role);
        const mockUser: User = {
          id: 'mock-user-id',
          name: email.split('@')[0],
          email,
          role: role, // Use the role parameter
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
      
      // If not using mock auth, use real API
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role }) // Include role in the request
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
      
      if (!USE_MOCK_AUTH) {
        throw error;
      } else if (role === 'admin') {
        // For admin, always throw the error - don't create mock admin for invalid credentials
        throw error;
      } else {
        // If error occurs but mock auth is enabled and not trying to login as admin,
        // still create a mock user
        const mockUser: User = {
          id: 'mock-user-id',
          name: email.split('@')[0],
          email,
          role: role, // Use the role parameter
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

  const register = async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
    try {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(`Password doesn't meet security requirements: ${passwordValidation.issues[0]}`);
      }
      
      // If trying to register as admin with the special email address, enforce password policy
      if (role === 'admin' && email === ADMIN_EMAIL && password !== ADMIN_PASSWORD) {
        throw new Error('Cannot register with this admin email. Please use a different email.');
      }
      
      if (USE_MOCK_AUTH) {
        // Mock successful registration (for testing without backend)
        console.log('Using mock auth for registration:', { name, email, role });
        
        // For admin registration, use specific naming
        const mockUser: User = {
          id: role === 'admin' ? 'admin-user-id' : 'mock-user-id',
          name: role === 'admin' ? 'Administrator' : name,
          email,
          role: role, // Use the role parameter (defaults to 'user')
          createdAt: new Date().toISOString()
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Store mock data
        localStorage.setItem('token', role === 'admin' ? 'mock-jwt-token-admin' : 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        return;
      }
      
      // For troubleshooting, log the request
      console.log('Registration request:', { name, email, password: '***', role });
      console.log('API URL:', `${API_URL}/users/register`);
      
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role }) // Include role in the request
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
      
      if (!USE_MOCK_AUTH || (role === 'admin' && email === ADMIN_EMAIL)) {
        throw error;
      } else {
        // If error occurs but mock auth is enabled, still create a mock user
        const mockUser: User = {
          id: 'mock-user-id',
          name,
          email,
          role: role, // Use the role parameter (defaults to 'user')
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};