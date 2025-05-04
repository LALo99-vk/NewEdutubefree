import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, LogOut, Menu, X, ChevronDown, Settings, BookOpen, Users, BarChart, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleAccountDropdown = () => {
    setShowAccountDropdown(!showAccountDropdown);
    if (showAdminDropdown) setShowAdminDropdown(false);
  };
  
  const toggleAdminDropdown = () => {
    setShowAdminDropdown(!showAdminDropdown);
    if (showAccountDropdown) setShowAccountDropdown(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };
  
  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);
    return `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-primary-100 text-primary-900'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;
  };
  
  // Helper function to navigate to a specific tab in the admin dashboard
  const navigateToAdminTab = (tab: string) => {
    navigate(`/admin?tab=${tab}`);
    setShowAdminDropdown(false);
  };
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-xl font-bold text-primary-600">EduTube</h1>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              <Link
                to="/"
                className={getLinkClass('/')}
              >
                Home
              </Link>
              <Link
                to="/courses"
                className={getLinkClass('/courses')}
              >
                Courses
              </Link>
              
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={getLinkClass('/admin')}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-64 input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
            
            {user ? (
              <div className="ml-4 relative flex items-center space-x-4">
                {/* Admin Dropdown for admin users */}
                {user.role === 'admin' && (
                  <div className="relative">
                    <div>
                      <button
                        type="button"
                        className="bg-white rounded-md p-1 flex items-center text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onClick={toggleAdminDropdown}
                      >
                        <span className="sr-only">Open admin menu</span>
                        <span className="text-sm font-medium mr-1">Admin</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showAdminDropdown ? 'transform rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    {showAdminDropdown && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="admin-menu">
                          <button
                            onClick={() => navigateToAdminTab('users')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <Users className="inline-block w-4 h-4 mr-2" />
                            Manage Users
                          </button>
                          <button
                            onClick={() => navigateToAdminTab('courses')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <BookOpen className="inline-block w-4 h-4 mr-2" />
                            Manage Courses
                          </button>
                          <button
                            onClick={() => navigateToAdminTab('courses')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <Trash className="inline-block w-4 h-4 mr-2" />
                            Delete Courses
                          </button>
                          <button
                            onClick={() => navigateToAdminTab('login-tracking')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <BarChart className="inline-block w-4 h-4 mr-2" />
                            Login Analytics
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              
                {/* User account dropdown */}
                <div className="relative">
                  <div>
                    <button
                      type="button"
                      className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onClick={toggleAccountDropdown}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </div>
                  
                  {showAccountDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1 border-b border-gray-100" role="none">
                        <p className="block px-4 py-2 text-sm text-gray-900 font-medium">
                          {user.name}
                        </p>
                        <p className="block px-4 py-1 text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <UserIcon className="inline-block w-4 h-4 mr-2" />
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <Settings className="inline-block w-4 h-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={handleLogout}
                        >
                          <LogOut className="inline-block w-4 h-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium rounded-md text-primary-600 bg-white border border-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block ${getLinkClass('/')}`}
          >
            Home
          </Link>
          <Link
            to="/courses"
            className={`block ${getLinkClass('/courses')}`}
          >
            Courses
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`block ${getLinkClass('/admin')}`}
            >
              Admin Dashboard
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {user.role === 'admin' && (
                  <>
                    <button
                      onClick={() => navigateToAdminTab('users')}
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Manage Users
                    </button>
                    <button
                      onClick={() => navigateToAdminTab('courses')}
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Manage Courses
                    </button>
                    <button
                      onClick={() => navigateToAdminTab('courses')}
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Delete Courses
                    </button>
                  </>
                )}
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-1 px-4">
              <Link
                to="/login"
                className="block px-4 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 mt-2 text-base font-medium text-primary-600 bg-white border border-primary-600 hover:bg-primary-50 rounded-md"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;