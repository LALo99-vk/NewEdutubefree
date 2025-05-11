import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, 
  Edit, Trash,
  Eye, X, Youtube,
  Search
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, authFetch } from '../../context/AuthContext';
import ProgressBar from '../../components/ui/ProgressBar';

// Interface definitions
interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  videoUrl?: string;
  category: { 
    _id: string; 
    name: string 
  };
  level: string;
  rating: number;
  totalStudents: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  duration?: string;  // Add duration as an optional property
  modules: Array<{
    _id: string;
    title: string;
    lessons: Array<{
      _id: string;
      title: string;
      duration: string;
    }>;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status?: 'active' | 'blocked'; // User access status
  enrolledCourses?: Array<{
    course: { _id: string; title: string };
    progress: number;
  }>;
  lastLogin?: string;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
  count: number;
}

const MOCK_COURSES: Course[] = [
  {
    _id: 'mock-course-1',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React, including components, state, and props.',
    instructor: 'Jane Smith',
    thumbnail: 'https://via.placeholder.com/640x360?text=React+Course',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: { _id: 'web-dev', name: 'Web Development' },
    level: 'Beginner',
    rating: 4.7,
    totalStudents: 1243,
    featured: true,
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-03-20T15:30:00Z',
    modules: [
      {
        _id: 'module-1',
        title: 'Getting Started with React',
        lessons: [
          { _id: 'lesson-1', title: 'What is React?', duration: '10:30' },
          { _id: 'lesson-2', title: 'Setting Up Your Environment', duration: '15:45' }
        ]
      }
    ]
  },
  {
    _id: 'mock-course-2',
    title: 'Advanced JavaScript Patterns',
    description: 'Deep dive into advanced JavaScript concepts and design patterns.',
    instructor: 'John Doe',
    thumbnail: 'https://via.placeholder.com/640x360?text=JavaScript+Course',
    videoUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    category: { _id: 'javascript', name: 'JavaScript' },
    level: 'Advanced',
    rating: 4.9,
    totalStudents: 856,
    featured: false,
    createdAt: '2023-02-10T14:20:00Z',
    updatedAt: '2023-04-05T09:15:00Z',
    modules: [
      {
        _id: 'module-1',
        title: 'Closures and Scopes',
        lessons: [
          { _id: 'lesson-1', title: 'Understanding Closures', duration: '12:20' },
          { _id: 'lesson-2', title: 'Lexical Scope', duration: '08:15' }
        ]
      }
    ]
  }
];

// No longer using mock users - using registered users from localStorage instead

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get tab from URL or default to 'courses'
  const tabFromUrl = new URLSearchParams(location.search).get('tab') || 'courses';
  
  // State
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  
  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Sort users by last login time for login tracking
  const sortedUsersByLogin = [...users].sort((a, b) => {
    // If lastLogin is missing for either, sort them to the bottom
    if (!a.lastLogin) return 1;
    if (!b.lastLogin) return -1;
    
    // Sort newest logins first
    return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
  });
  
  // Handle toggling user access status
  const toggleUserAccess = async (userId: string, currentStatus: string | undefined) => {
    try {
      // Determine new status
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      
      // Optimistically update the UI
      const updatedUsers = users.map(user => {
        if (user._id === userId) {
          return { ...user, status: newStatus as 'active' | 'blocked' };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      // Try to update in the API
      try {
        const response = await authFetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user status');
        }
      } catch (error) {
        console.error('API error updating user status:', error);
        // Status change is kept locally even if API fails
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  // Listen for tab changes in URL
  useEffect(() => {
    const queryTab = new URLSearchParams(location.search).get('tab');
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [location.search]);

  // Calculate course progress based on enrolled user data
  useEffect(() => {
    if (users.length > 0 && courses.length > 0) {
      const progress: Record<string, number> = {};
      
      // Initialize all courses with 0% progress
      courses.forEach(course => {
        progress[course._id] = 0;
      });
      
      // Calculate progress for each course based on enrolled users
      users.forEach(user => {
        if (user.enrolledCourses && user.enrolledCourses.length > 0) {
          user.enrolledCourses.forEach(enrollment => {
            const courseId = enrollment.course._id;
            if (progress[courseId] !== undefined) {
              // Update the progress value by averaging with existing values
              const currentTotal = progress[courseId] || 0;
              const count = Object.keys(progress).includes(courseId) ? 2 : 1;
              progress[courseId] = (currentTotal + enrollment.progress) / count;
            }
          });
        }
      });
      
      // Random progress for demo purposes if no real progress data exists
      courses.forEach(course => {
        if (progress[course._id] === 0) {
          // Generate random progress between 0 and 100 for each course for demonstration
          progress[course._id] = Math.floor(Math.random() * 101);
        }
      });
      
      setCourseProgress(progress);
    }
  }, [users, courses]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
      setError('');
      
      try {
        // Fetch courses
        const coursesResponse = await authFetch('http://localhost:5000/api/courses');
        if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
        const coursesData = await coursesResponse.json();
            setCourses(coursesData);
          
        // Fetch users
        const usersResponse = await authFetch('http://localhost:5000/api/users');
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
          setUsers(usersData);
          
        // Fetch categories
        const categoriesResponse = await authFetch('http://localhost:5000/api/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Change tab function
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/admin?tab=${tab}`);
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new course
  const handleAddCourse = async (newCourseData: Partial<Course>) => {
    try {
      const response = await authFetch('http://localhost:5000/api/courses', {
        method: 'POST',
        body: JSON.stringify(newCourseData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create course');
      }
      
      const createdCourse = await response.json();
      setCourses(prevCourses => [...prevCourses, createdCourse]);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleViewCourse = (course: Course) => {
    setViewingCourse(course);
    setShowViewModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowEditModal(true);
  };

  // Handle deleting a course
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await authFetch(`http://localhost:5000/api/courses/${courseId}`, {
            method: 'DELETE',
          });
          
      if (!response.ok) {
        throw new Error('Failed to delete course');
          }
      
      setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Handle updating a course
  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      const response = await authFetch(`http://localhost:5000/api/courses/${updatedCourse._id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCourse),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update course');
      }
      
      const updatedCourseData = await response.json();
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === updatedCourse._id ? updatedCourseData : course
        )
      );
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Render
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
              onClick={() => setShowEditModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('courses')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => handleTabChange('progress')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Progress Tracking
            </button>
            <button
              onClick={() => handleTabChange('login')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'login'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Login Tracking
            </button>
          </nav>
        </div>
        
        {/* Courses Tab Content */}
        {activeTab === 'courses' && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Course Management</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 hover:text-blue-800"
                  onClick={() => setSearchQuery('')}
                >
                  {searchQuery && <X className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="bg-white shadow overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=Course';
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                                <span className="text-xs">No img</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.instructor}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {course.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.totalStudents || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProgressBar 
                          progress={courseProgress[course._id] || 0} 
                          height={8} 
                          showPercentage={true}
                          color={courseProgress[course._id] < 30 ? 'bg-red-500' : 
                                courseProgress[course._id] < 70 ? 'bg-yellow-500' : 'bg-green-500'}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCourse(course)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View course details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit course"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingCourse(course);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete course"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        {isLoading ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <div>
                            {error ? (
                              <div className="text-red-500">{error}</div>
                            ) : (
                              <div>No courses found</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Login Tracking Tab Content */}
        {activeTab === 'login' && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Login Activity</h2>
              <div className="text-sm text-gray-500">
                Showing most recent logins first
              </div>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses Enrolled
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedUsersByLogin.length > 0 ? (
                    sortedUsersByLogin.map((user) => {
                      const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
                      const now = new Date();
                      const daysDifference = lastLogin ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : null;
                      
                      // Determine status based on last login
                      let statusColor = 'bg-gray-100 text-gray-800';
                      let statusText = 'Never Logged In';
                      
                      if (lastLogin) {
                        const daysDiff = daysDifference || 0;
                        if (daysDiff === 0) {
                          statusColor = 'bg-green-100 text-green-800';
                          statusText = 'Today';
                        } else if (daysDiff === 1) {
                          statusColor = 'bg-green-100 text-green-800';
                          statusText = 'Yesterday';
                        } else if (daysDiff < 7) {
                          statusColor = 'bg-blue-100 text-blue-800';
                          statusText = `${daysDiff} days ago`;
                        } else if (daysDiff < 30) {
                          statusColor = 'bg-yellow-100 text-yellow-800';
                          statusText = `${Math.floor(daysDiff / 7)} weeks ago`;
                        } else {
                          statusColor = 'bg-red-100 text-red-800';
                          statusText = `${Math.floor(daysDiff / 30)} months ago`;
                        }
                      }
                      
                      return (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xl text-gray-600">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lastLogin ? (
                              <div>
                                <div className="text-sm text-gray-900">
                                  {lastLogin.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {lastLogin.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Never</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.enrolledCourses ? user.enrolledCourses.length : 0}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        {isLoading ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <div>
                            {error ? (
                              <div className="text-red-500">{error}</div>
                            ) : (
                              <div>No user login data available</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 hover:text-blue-800"
                  onClick={() => setSearchQuery('')}
                >
                  {searchQuery && <X className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.filter(user => 
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(user => {
                    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
                    return (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xl text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role || 'student'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lastLogin ? (
                            <div className="text-sm text-gray-900">
                              {lastLogin.toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Never</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.enrolledCourses ? user.enrolledCourses.length : 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => toggleUserAccess(user._id, user.status)}
                              className={`px-3 py-1 rounded-md ${
                                user.status === 'active' || !user.status
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {user.status === 'active' || !user.status ? 'Block Access' : 'Allow Access'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        {isLoading ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <div>
                            {error ? (
                              <div className="text-red-500">{error}</div>
                            ) : (
                              <div>No users found</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Progress Tracking Tab Content */}
        {activeTab === 'progress' && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Course Progress Overview</h2>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(course => {
                  const progress = courseProgress[course._id] || 0;
                  return (
                    <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-3">
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120?text=Course';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-xs">No img</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.totalStudents || 0} enrolled</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <ProgressBar 
                          progress={progress} 
                          height={8} 
                          showPercentage={true}
                          color={progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500'}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-500">Completion rate</span>
                        <span className="font-medium text-gray-700">
                          {progress < 30 ? 'Low' : progress < 70 ? 'Medium' : 'High'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{courses.length}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{users.length}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Categories</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{categories.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Course Modal */}
        {showViewModal && viewingCourse && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{viewingCourse.title}</h3>
                    <button
                      type="button"
                      onClick={() => setShowViewModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="mt-2 space-y-4">
                    {viewingCourse.thumbnail && (
                      <div className="mb-4">
                        <img 
                          src={viewingCourse.thumbnail} 
                          alt={viewingCourse.title}
                          className="w-full h-48 object-cover rounded-lg" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Course+Thumbnail';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-xl font-bold">{viewingCourse.title}</h2>
                      <p className="text-sm text-gray-500">by {viewingCourse.instructor}</p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {viewingCourse.category?.name || 'Uncategorized'}
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {viewingCourse.level}
                        </span>
                        {viewingCourse.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <p className="mt-1 text-gray-600 whitespace-pre-line">{viewingCourse.description}</p>
                    </div>
                    
                    {viewingCourse.videoUrl && (
                      <div>
                        <h4 className="font-medium text-gray-900">Video</h4>
                        <div className="mt-2">
                          <a 
                            href={viewingCourse.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:underline"
                          >
                            <Youtube className="h-5 w-5 mr-1 text-red-600" />
                            Watch on YouTube
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {viewingCourse.modules && viewingCourse.modules.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900">Course Modules</h4>
                        <div className="mt-2 space-y-3">
                          {viewingCourse.modules.map((module) => (
                            <div key={module._id} className="border border-gray-200 rounded-md p-3">
                              <h5 className="font-medium">{module.title}</h5>
                              {module.lessons && module.lessons.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {module.lessons.map((lesson) => (
                                    <li key={lesson._id} className="text-sm text-gray-600 flex justify-between">
                                      <span>{lesson.title}</span>
                                      <span className="text-gray-500">{lesson.duration}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
                      <span>Created: {new Date(viewingCourse.createdAt).toLocaleDateString()}</span>
                      <span>Last updated: {new Date(viewingCourse.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditCourse(viewingCourse);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Edit Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingCourse && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Course</h3>
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this course? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(deletingCourse._id)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingCourse(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Course Form Modal - Add/Edit Course */}
        {showEditModal && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  
                  if (editingCourse) {
                    // Edit existing course
                    const formElement = e.currentTarget;
                    const formData = new FormData(formElement);
                    
                    // Update the editingCourse with form values
                    const updatedCourse = {
                      ...editingCourse,
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      instructor: formData.get('instructor') as string,
                      thumbnail: formData.get('thumbnail') as string || 'https://via.placeholder.com/640x360?text=Course',
                      videoUrl: formData.get('videoUrl') as string,
                      level: formData.get('level') as string,
                      category: {
                        _id: formData.get('category') as string,
                        name: formData.get('category') as string
                      }
                    };
                    
                    handleUpdateCourse(updatedCourse);
                  } else {
                    // Add new course
                    const formElement = e.currentTarget;
                    const formData = new FormData(formElement);
                    
                    const newCourse: Partial<Course> = {
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      instructor: formData.get('instructor') as string,
                      thumbnail: formData.get('thumbnail') as string || 'https://via.placeholder.com/640x360?text=Course',
                      videoUrl: formData.get('videoUrl') as string,
                      level: formData.get('level') as string,
                      category: {
                        _id: formData.get('category') as string,
                        name: formData.get('category') as string
                      }
                    };
                    
                    handleAddCourse(newCourse);
                  }
                  
                  setShowEditModal(false);
                  setEditingCourse(null);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter course title"
                        defaultValue={editingCourse?.title || ''}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter course description"
                        rows={4}
                        defaultValue={editingCourse?.description || ''}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor *
                      </label>
                      <input
                        type="text"
                        name="instructor"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter instructor name"
                        defaultValue={editingCourse?.instructor || ''}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          name="category"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          defaultValue={editingCourse?.category?._id || ''}
                          required
                        >
                          <option value="">Select category</option>
                              <option value="web-dev">Web Development</option>
                              <option value="javascript">JavaScript</option>
                              <option value="react">React</option>
                              <option value="mobile-dev">Mobile Development</option>
                              <option value="data-science">Data Science</option>
                              <option value="machine-learning">Machine Learning</option>
                              <option value="design">Design</option>
                              <option value="devops">DevOps</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Level
                        </label>
                        <select
                          name="level"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          defaultValue={editingCourse?.level || 'beginner'}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL (YouTube)
                      </label>
                      <input
                        type="url"
                        name="videoUrl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="https://www.youtube.com/watch?v=..."
                        defaultValue={editingCourse?.videoUrl || ''}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter a YouTube video URL for the course preview
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thumbnail
                      </label>
                      <input
                        type="url"
                        name="thumbnail"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="https://example.com/image.jpg"
                        value={editingCourse?.thumbnail || ''}
                        onChange={(e) => {
                          if (editingCourse) {
                            setEditingCourse({
                              ...editingCourse,
                              thumbnail: e.target.value
                            });
                          }
                        }}
                      />
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Or select a thumbnail:
                        </label>
                        <div className="max-h-60 overflow-y-auto">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {editingCourse?.category && [
                              'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg',
                              'https://cdn.pixabay.com/photo/2019/10/03/12/12/javascript-4523100_1280.jpg',
                              'https://cdn.pixabay.com/photo/2016/12/28/09/36/web-1935737_1280.png',
                              'https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_1280.jpg'
                            ].includes(editingCourse.category.name) ? (
                              // Display category-specific thumbnails
                              [
                                'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg',
                                'https://cdn.pixabay.com/photo/2019/10/03/12/12/javascript-4523100_1280.jpg',
                                'https://cdn.pixabay.com/photo/2016/12/28/09/36/web-1935737_1280.png',
                                'https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_1280.jpg'
                              ].map((url, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (editingCourse) {
                                      setEditingCourse({
                                        ...editingCourse,
                                        thumbnail: url
                                      });
                                    }
                                  }}
                                  className={`cursor-pointer border-2 overflow-hidden hover:opacity-90 transition rounded ${
                                    editingCourse?.thumbnail === url ? 'border-blue-500' : 'border-transparent'
                                  }`}
                                >
                                  <img src={url} alt={`Thumbnail option ${index + 1}`} className="w-full h-24 object-cover" />
                                </div>
                              ))
                            ) : (
                              // Display generic thumbnails
                              [
                                'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg',
                                'https://cdn.pixabay.com/photo/2019/10/03/12/12/javascript-4523100_1280.jpg',
                                'https://cdn.pixabay.com/photo/2017/08/10/02/05/tiles-shapes-2617112_1280.jpg',
                                'https://cdn.pixabay.com/photo/2017/05/10/19/29/robot-2301646_1280.jpg',
                                'https://cdn.pixabay.com/photo/2018/02/15/10/35/server-3155000_1280.jpg',
                                'https://cdn.pixabay.com/photo/2018/09/18/11/19/artificial-intelligence-3685928_1280.png'
                              ].map((url, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (editingCourse) {
                                      setEditingCourse({
                                        ...editingCourse,
                                        thumbnail: url
                                      });
                                    }
                                  }}
                                  className={`cursor-pointer border-2 overflow-hidden hover:opacity-90 transition rounded ${
                                    editingCourse?.thumbnail === url ? 'border-blue-500' : 'border-transparent'
                                  }`}
                                >
                                  <img src={url} alt={`Thumbnail option ${index + 1}`} className="w-full h-24 object-cover" />
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., 1h 30m"
                        defaultValue={editingCourse?.duration || '1h 30m'}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingCourse(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingCourse ? 'Save Changes' : 'Add Course'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;