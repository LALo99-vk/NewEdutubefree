import React, { useState } from 'react';
import { 
  Users, BookOpen, List, Plus, Search, 
  BarChart, TrendingUp, UserPlus, Filter, Eye, Edit, Trash 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courses } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect if not admin
  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }
  
  const stats = {
    totalCourses: courses.length,
    totalUsers: 4278,
    totalLessons: courses.reduce((sum, course) => {
      return sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0);
    }, 0),
    totalCategories: new Set(courses.map(course => course.category)).size,
  };
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your platform content and users</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              className="btn btn-primary flex items-center"
              onClick={() => navigate('/admin/courses/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              className={`px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'overview' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'courses' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('courses')}
            >
              Courses
            </button>
            <button
              className={`px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'users' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </nav>
        </div>
        
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3 text-primary-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Total Courses</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCourses}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3 text-secondary-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Total Users</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-accent-100 rounded-md p-3 text-accent-600">
                    <List className="h-6 w-6" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Total Lessons</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalLessons}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3 text-yellow-600">
                    <Filter className="h-6 w-6" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Categories</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCategories}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Registrations</h3>
                  <div className="text-sm text-gray-500">Last 7 days</div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-primary-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="ml-2">
                    <span className="text-green-600 text-sm font-medium">+5.2%</span>
                    <span className="text-gray-500 text-sm ml-1">vs last week</span>
                  </div>
                </div>
                <div className="mt-4 h-64 flex items-end justify-between">
                  {[65, 59, 80, 81, 56, 55, 70].map((value, index) => (
                    <div key={index} className="w-8 bg-primary-100 rounded-t relative" style={{ height: `${value}%` }}>
                      <div 
                        className="absolute inset-x-0 top-0 bg-primary-500 rounded-t transition-all duration-500"
                        style={{ height: `${value}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-xs text-gray-500">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Popular Categories</h3>
                  <div className="text-sm text-gray-500">By courses</div>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Web Development</span>
                      <span>42 courses</span>
                    </div>
                    <div className="mt-2 relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Data Science</span>
                      <span>28 courses</span>
                    </div>
                    <div className="mt-2 relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Machine Learning</span>
                      <span>23 courses</span>
                    </div>
                    <div className="mt-2 relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Mobile Development</span>
                      <span>19 courses</span>
                    </div>
                    <div className="mt-2 relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>UI/UX Design</span>
                      <span>15 courses</span>
                    </div>
                    <div className="mt-2 relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-2 text-green-600">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">New user registered</p>
                      <p className="text-sm text-gray-500">john.doe@example.com</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">5 minutes ago</div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 text-primary-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">New course published</p>
                      <p className="text-sm text-gray-500">Python for Data Science and Machine Learning</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">1 hour ago</div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2 text-yellow-600">
                      <Edit className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Course updated</p>
                      <p className="text-sm text-gray-500">Complete React Developer in 2025</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">3 hours ago</div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-2 text-green-600">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">New user registered</p>
                      <p className="text-sm text-gray-500">jane.smith@example.com</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">5 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'courses' && (
          <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="input pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <select className="input">
                  <option>All Categories</option>
                  <option>Web Development</option>
                  <option>Data Science</option>
                  <option>Mobile Development</option>
                  <option>UI/UX Design</option>
                </select>
                <button className="btn btn-primary flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.map(course => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded object-cover" src={course.thumbnail} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{course.title}</div>
                              <div className="text-sm text-gray-500">{course.level}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge badge-primary">{course.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.instructor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge bg-green-100 text-green-800">
                            Published
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.totalStudents.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {course.rating.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              className="text-primary-600 hover:text-primary-900"
                              onClick={() => navigate(`/courses/${course.id}`)}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button className="text-secondary-600 hover:text-secondary-900">
                              <Edit className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="btn btn-outline py-2">Previous</button>
                  <button className="btn btn-outline py-2">Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                      <span className="font-medium">{filteredCourses.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100"
                      >
                        2
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        3
                      </a>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        8
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        9
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        10
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'users' && (
          <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input pl-10 w-full"
                />
              </div>
              <div className="flex space-x-3">
                <select className="input">
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>User</option>
                </select>
                <button className="btn btn-primary flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'user', status: 'active', joined: '2024-01-15' },
                      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'admin', status: 'active', joined: '2023-11-10' },
                      { id: 3, name: 'Michael Johnson', email: 'michael.j@example.com', role: 'user', status: 'inactive', joined: '2024-02-22' },
                      { id: 4, name: 'Sarah Williams', email: 'sarah.w@example.com', role: 'user', status: 'active', joined: '2024-03-05' },
                      { id: 5, name: 'David Miller', email: 'david.m@example.com', role: 'user', status: 'active', joined: '2023-12-18' },
                    ].map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                                {user.name.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            user.role === 'admin' ? 'bg-secondary-100 text-secondary-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.joined).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-secondary-600 hover:text-secondary-900">
                              <Edit className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="btn btn-outline py-2">Previous</button>
                  <button className="btn btn-outline py-2">Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
                      <span className="font-medium">25</span> users
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        2
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        3
                      </a>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        5
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;