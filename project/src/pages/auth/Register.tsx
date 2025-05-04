import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Users, Shield, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Password validation states
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate password whenever it changes
  useEffect(() => {
    if (password) {
      setPasswordTouched(true);
    }
    
    // Check for uppercase letters
    setHasUpperCase(/[A-Z]/.test(password));
    
    // Check for lowercase letters
    setHasLowerCase(/[a-z]/.test(password));
    
    // Check for numbers
    setHasNumber(/[0-9]/.test(password));
    
    // Check for special characters
    setHasSpecialChar(/[^A-Za-z0-9]/.test(password));
    
    // Check overall validity
    const isValid = (
      password.length >= 8 && 
      hasUpperCase && 
      hasLowerCase && 
      hasNumber && 
      hasSpecialChar
    );
    
    setIsValidPassword(isValid);
    
    // Show validation alert if password has been touched and is invalid
    if (passwordTouched && !isValid) {
      setShowValidationAlert(true);
    } else {
      setShowValidationAlert(false);
    }
  }, [password, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, passwordTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo(null);
    setPasswordTouched(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!isValidPassword) {
      setError('Password does not meet all requirements');
      setShowValidationAlert(true);
      return;
    }
    
    setIsLoading(true);
    try {
      setDebugInfo('Attempting to register with API...');
      await register(name, email, password, role);
      setDebugInfo('Registration successful, redirecting...');
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Display more specific error messages
      if (err.message && err.message.includes('User already exists')) {
        setError('A user with this email already exists. Please use a different email or try logging in.');
      } else if (err.message && err.message.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(`Registration failed: ${err.message || 'Unknown error'}`);
      }
      setDebugInfo(`Error details: ${JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your account
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
          
          {showValidationAlert && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 font-medium">Password Requirements Not Met</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your password must include:
                  </p>
                  <ul className="text-xs text-yellow-700 list-disc ml-5 mt-1">
                    {!hasUpperCase && <li>At least one uppercase character</li>}
                    {!hasLowerCase && <li>At least one lowercase character</li>}
                    {!hasNumber && <li>At least one number</li>}
                    {!hasSpecialChar && <li>At least one special character</li>}
                    {password.length < 8 && <li>Minimum 8 characters</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {debugInfo && (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative text-xs">
              <strong>Debug Info:</strong> {debugInfo}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input pl-10"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
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
                  autoComplete="new-password"
                  required
                  className={`input pl-10 ${isValidPassword ? 'border-green-500' : password ? 'border-yellow-500' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                />
              </div>
              
              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-2 space-y-2 text-sm">
                  <p className="font-medium text-gray-700">Password must contain:</p>
                  <ul className="space-y-1 pl-1">
                    <li className="flex items-center">
                      {hasUpperCase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={hasUpperCase ? 'text-green-700' : 'text-gray-600'}>
                        At least one uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center">
                      {hasLowerCase ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={hasLowerCase ? 'text-green-700' : 'text-gray-600'}>
                        At least one lowercase letter
                      </span>
                    </li>
                    <li className="flex items-center">
                      {hasNumber ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={hasNumber ? 'text-green-700' : 'text-gray-600'}>
                        At least one number
                      </span>
                    </li>
                    <li className="flex items-center">
                      {hasSpecialChar ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
                        At least one special character
                      </span>
                    </li>
                    <li className="flex items-center">
                      {password.length >= 8 ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={password.length >= 8 ? 'text-green-700' : 'text-gray-600'}>
                        Minimum 8 characters
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Register as
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

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </label>
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
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Register as {role === 'admin' ? 'Admin' : 'User'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;