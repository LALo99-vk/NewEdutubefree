import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div onClick={() => navigate('/')} className="flex-shrink-0 flex items-center cursor-pointer">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduTube</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a 
                href="/" 
                className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </a>
              <a
                href="/courses"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Courses
              </a>
              <a
                href="/categories"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Categories
              </a>
              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin
                </a>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-64 input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </form>
            <div className="ml-4 flex items-center">
              {isAuthenticated ? (
                <div className="ml-3 relative flex items-center">
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full flex items-center text-sm focus:outline-none"
                  >
                    <span className="mr-2">{user?.name}</span>
                    <User className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="ml-4 text-gray-500 hover:text-gray-700 p-1 rounded-full flex items-center text-sm focus:outline-none"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-outline"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn btn-primary"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="/"
              className="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Home
            </a>
            <a
              href="/courses"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Courses
            </a>
            <a
              href="/categories"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Categories
            </a>
            {user?.role === 'admin' && (
              <a
                href="/admin"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Admin
              </a>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <form onSubmit={handleSearch} className="px-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>
            {isAuthenticated ? (
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 rounded-full bg-gray-100 p-2" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="px-4 flex flex-col space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn btn-outline"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full btn btn-primary"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;