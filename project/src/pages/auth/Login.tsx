import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, LogIn, Users, Shield, InfoIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Admin credentials are secured in the AuthContext
// Do not expose admin credentials directly in the UI

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Admin credentials verification will be handled by the AuthContext
      
      // Pass the role parameter to the login function
      await login(email, password, role); 
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // We no longer need this helper function as we're selecting role directly via UI

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login as
            </label>
            <div className="flex space-x-4">
              <div 
                className={`flex-1 border rounded-md p-4 cursor-pointer transition-colors ${
                  role === 'user' 
                    ? 'bg-primary-50 border-primary-500 text-primary-700' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => setRole('user')}
              >
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8" />
                </div>
                <p className="text-center font-medium">User</p>
                <p className="text-center text-xs mt-1">Browse courses & learn</p>
              </div>
              
              <div 
                className={`flex-1 border rounded-md p-4 cursor-pointer transition-colors ${
                  role === 'admin' 
                    ? 'bg-secondary-50 border-secondary-500 text-secondary-700' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => setRole('admin')}
              >
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-8 w-8" />
                </div>
                <p className="text-center font-medium">Admin</p>
                <p className="text-center text-xs mt-1">Manage platform & content</p>
              </div>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full btn py-3 flex justify-center ${
                  role === 'admin' ? 'btn-secondary' : 'btn-primary'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in as {role === 'admin' ? 'Admin' : 'User'}
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Login Information</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="bg-blue-50 p-3 rounded mb-2 flex items-start">
                <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Secure Admin Access</p>
                  <p className="text-blue-700 text-xs mt-1">
                    Admin login requires authorized credentials. If you're an administrator, please use your secure admin credentials to access the admin dashboard.
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: Only authorized admin accounts can access admin controls. Regular users don't have access to administrative features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;