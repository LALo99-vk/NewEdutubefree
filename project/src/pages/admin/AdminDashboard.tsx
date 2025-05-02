import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, List, Plus, Search, 
  Edit, Trash,
  Activity, Eye
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
  courseId: string;
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
            
            avgProgress = Math.round(totalProgress / totalEnrolled);
          }
          
          return {
            courseId: course._id,
            courseName: course.title,
            averageProgress: avgProgress,
            totalStudents: totalEnrolled
          };
        });
        
        setCourseProgress(progressStats);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    totalCategories: categories.length
  };
  
  // Calculate average course completion for all users
  const calculateOverallProgress = () => {
    if (!users.length || !courses.length) return [];
    
    const courseProgressData: CourseProgress[] = courses.map((course: Course) => {
      const enrolledUsers = users.filter((user: User) => 
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
        
        avgProgress = Math.round(totalProgress / totalEnrolled);
      }
      
      return {
        courseId: course._id,
        courseName: course.title,
        averageProgress: avgProgress,
        totalStudents: totalEnrolled
      };
    });
    
    // Sort by popularity (number of students)
    return courseProgressData.sort((a, b) => b.totalStudents - a.totalStudents);
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
                  <p className="text-3xl font-bold text-primary-600 mb-2">
                    {calculateOverallProgress().length > 0 ? 
                      Math.round(calculateOverallProgress().reduce((sum, cp) => sum + cp.averageProgress, 0) / calculateOverallProgress().length) : 0}%
                  </p>
                  <ProgressBar 
                    progress={calculateOverallProgress().length > 0 ? 
                      Math.round(calculateOverallProgress().reduce((sum, cp) => sum + cp.averageProgress, 0) / calculateOverallProgress().length) : 0} 
                    height={10} 
                  />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Users</p>
                  <h3 className="text-2xl font-bold">{users.length}</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Courses</p>
                  <h3 className="text-2xl font-bold">{courses.length}</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <List className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Categories</p>
                  <h3 className="text-2xl font-bold">{categories.length}</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <Activity className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Avg. Completion</p>
                  <h3 className="text-2xl font-bold">
                    {users.length > 0 ? 
                      Math.round(
                        users.reduce((sum, user) => {
                          if (!user.enrolledCourses || user.enrolledCourses.length === 0) return sum;
                          const userAvgProgress = user.enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / user.enrolledCourses.length;
                          return sum + userAvgProgress;
                        }, 0) / users.filter(user => user.enrolledCourses && user.enrolledCourses.length > 0).length || 1
                      ) : 0
                    }%
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Course Completion Rates</h3>
                </div>
                {courseProgress.length > 0 ? (
                  <div className="space-y-4">
                    {courseProgress.slice(0, 5).map((course, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate" style={{ maxWidth: '70%' }}>
                            {course.courseName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {course.totalStudents} {course.totalStudents === 1 ? 'student' : 'students'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-grow mr-2">
                            <ProgressBar 
                              progress={course.averageProgress} 
                              color={
                                course.averageProgress < 30 ? 'bg-red-500' : 
                                course.averageProgress < 70 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }
                            />
                          </div>
                          <span className="text-sm font-medium">{course.averageProgress}%</span>
                        </div>
                      </div>
                    ))}
                    {courseProgress.length > 5 && (
                      <div className="text-center mt-4">
                        <button 
                          onClick={() => setActiveTab('courses')}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          View all courses
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No course data available.</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent User Enrollments</h3>
                </div>
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users
                      .filter(user => user.enrolledCourses && user.enrolledCourses.length > 0)
                      .sort((a, b) => {
                        // This is a simple sorting, you might want to sort by enrollment date if available
                        return (b.enrolledCourses?.length || 0) - (a.enrolledCourses?.length || 0);
                      })
                      .slice(0, 5)
                      .map((user, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.enrolledCourses?.length || 0} courses</p>
                            </div>
                          </div>
                          <div>
                            {user.enrolledCourses && user.enrolledCourses.length > 0 && (
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {Math.round(
                                    user.enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / 
                                    user.enrolledCourses.length
                                  )}% avg
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                    {users.filter(user => user.enrolledCourses && user.enrolledCourses.length > 0).length > 5 && (
                      <div className="text-center mt-4">
                        <button 
                          onClick={() => setActiveTab('users')}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          View all users
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No user enrollment data available.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Enrollment & Progress Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseProgress.slice(0, 10).map((course, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 truncate" style={{ maxWidth: '250px' }}>
                            {course.courseName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{course.totalStudents}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-48">
                            <ProgressBar 
                              progress={course.averageProgress} 
                              color={
                                course.averageProgress < 30 ? 'bg-red-500' : 
                                course.averageProgress < 70 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${course.averageProgress < 30 ? 'bg-red-100 text-red-800' : 
                              course.averageProgress < 70 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'}`}>
                            {course.averageProgress < 30 ? 'Low Completion' : 
                             course.averageProgress < 70 ? 'In Progress' : 
                             'High Completion'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'courses' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Course Management</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="absolute left-3 top-2.5">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <Link to="/admin/courses/new" className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700">
                  <Plus className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
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
                  {courses
                    .filter(course => 
                      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (course.instructor && course.instructor.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (course.category?.name && course.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((course) => {
                      const courseProgressItem = courseProgress.find(cp => cp.courseId === course._id);
                      return (
                        <tr key={course._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="h-10 w-10 rounded object-cover mr-3" />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                                  <BookOpen className="h-5 w-5 text-gray-500" />
                                </div>
                              )}
                              <div className="font-medium text-gray-900">{course.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {course.category?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {courseProgressItem?.totalStudents || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-48">
                              <ProgressBar 
                                progress={courseProgressItem?.averageProgress || 0} 
                                color={
                                  !courseProgressItem || courseProgressItem.averageProgress < 30 ? 'bg-red-500' : 
                                  courseProgressItem.averageProgress < 70 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link to={`/courses/${course._id}`} className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-5 w-5 inline" />
                            </Link>
                            <Link to={`/admin/courses/edit/${course._id}`} className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="h-5 w-5 inline" />
                            </Link>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
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
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-lg text-primary-600 font-bold">
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