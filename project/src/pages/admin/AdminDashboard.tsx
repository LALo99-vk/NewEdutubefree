import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, List, Plus, Search, 
  BarChart, TrendingUp, UserPlus, Filter, Eye, Edit, Trash,
  PieChart, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ui/ProgressBar';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  category: { _id: string; name: string };
  level: string;
  rating: number;
  totalStudents: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
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
  enrolledCourses?: Array<{
    course: { _id: string; title: string };
    progress: number;
  }>;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
  count: number;
}

interface CourseProgress {
  courseName: string;
  averageProgress: number;
  totalStudents: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if not admin
  if (user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch courses
        const coursesResponse = await fetch('http://localhost:8080/api/courses', {
          headers: {
            'x-auth-token': token
          }
        });

        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses');
        }

        const coursesData = await coursesResponse.json();
        setCourses(coursesData);

        // Fetch users
        const usersResponse = await fetch('http://localhost:8080/api/users', {
          headers: {
            'x-auth-token': token
          }
        });

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:8080/api/categories');

        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }

        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Calculate course progress statistics
        // In a real app, you might have a dedicated endpoint for this
        const progressStats = coursesData.map((course: Course) => {
          const enrolledUsers = usersData.filter((user: User) => 
            user.enrolledCourses && user.enrolledCourses.some((ec: { course: { _id: string } }) => 
              ec.course._id === course._id
            )
          );
          
          const totalEnrolled = enrolledUsers.length;
          
          let avgProgress = 0;
          if (totalEnrolled > 0) {
            const totalProgress = enrolledUsers.reduce((sum: number, user: User) => {
              const courseEnrollment = user.enrolledCourses?.find((ec: { course: { _id: string } }) => 
                ec.course._id === course._id
              );
              return sum + (courseEnrollment?.progress || 0);
            }, 0);
            
            avgProgress = totalProgress / totalEnrolled;
          }
          
          return {
            courseName: course.title,
            averageProgress: avgProgress,
            totalStudents: totalEnrolled
          };
        });
        
        setCourseProgress(progressStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const stats = {
    totalCourses: courses.length,
    totalUsers: users.length,
    totalLessons: courses.reduce((sum, course) => {
      return sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0);
    }, 0),
    totalCategories: categories.length,
  };
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate average course completion for all users
  const calculateOverallProgress = () => {
    if (users.length === 0) return 0;
    
    const usersWithCourses = users.filter(u => u.enrolledCourses && u.enrolledCourses.length > 0);
    if (usersWithCourses.length === 0) return 0;
    
    const totalProgress = usersWithCourses.reduce((sum: number, u: User) => {
      if (!u.enrolledCourses) return sum;
      
      const userAvgProgress = u.enrolledCourses.reduce(
        (courseSum: number, enrollment: { progress: number }) => courseSum + enrollment.progress, 0
      ) / u.enrolledCourses.length;
      
      return sum + userAvgProgress;
    }, 0);
    
    return Math.round(totalProgress / usersWithCourses.length);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
            <button
              className={`px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'progress' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('progress')}
            >
              Progress Tracking
            </button>
          </nav>
        </div>
        
        {activeTab === 'progress' && (
          <>
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Course Progress Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Overall Course Completion</h3>
                  <p className="text-3xl font-bold text-primary-600 mb-2">{calculateOverallProgress()}%</p>
                  <ProgressBar progress={calculateOverallProgress()} height={10} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Active Learners</h3>
                  <p className="text-3xl font-bold text-primary-600">
                    {users.filter(u => u.enrolledCourses && u.enrolledCourses.length > 0).length}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {users.length > 0 
                      ? Math.round((users.filter(u => u.enrolledCourses && u.enrolledCourses.length > 0).length / users.length) * 100) 
                      : 0}% of total users
                  </p>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-700 mb-4">Course Completion Rates</h3>
              {courseProgress
                .filter(cp => cp.totalStudents > 0)
                .sort((a, b) => b.totalStudents - a.totalStudents)
                .slice(0, 5)
                .map((cp, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cp.courseName}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {cp.totalStudents} student{cp.totalStudents !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <ProgressBar 
                      progress={cp.averageProgress} 
                      color={cp.averageProgress > 75 ? "bg-green-600" : cp.averageProgress > 50 ? "bg-blue-600" : "bg-primary-600"}
                    />
                  </div>
                ))}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">User Progress Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Progress</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter(u => u.enrolledCourses && u.enrolledCourses.length > 0)
                      .slice(0, 10)
                      .map((user: User) => {
                        const avgProgress = user.enrolledCourses 
                          ? Math.round(user.enrolledCourses.reduce((sum: number, ec: { progress: number }) => sum + ec.progress, 0) / user.enrolledCourses.length)
                          : 0;
                          
                        return (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-primary-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.enrolledCourses?.length || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-32">
                                <ProgressBar progress={avgProgress} height={6} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
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
                              <div key={course._id} className="overflow-hidden shadow-md rounded-lg bg-white">
                                <div className="p-6">
                                  <div className="flex items-start">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                                      <p className="mt-1 text-sm text-gray-500">{course.instructor}</p>
                                    </div>
                                    <div>
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${course.level === 'beginner' ? 'bg-green-100 text-green-800' : course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {course.level}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                                  </div>
                                  <div className="mt-4 flex items-center">
                                    <div className="flex text-yellow-400">
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                                      </div>
                                    </div>
                                    <div className="ml-auto flex">
                                      <button
                                        onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                                        className="text-gray-400 hover:text-primary-600 mr-2"
                                      >
                                        <Edit className="h-5 w-5" />
                                      </button>
                                      <button
                                        className="text-gray-400 hover:text-red-600"
                                      >
                                        <Trash className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
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