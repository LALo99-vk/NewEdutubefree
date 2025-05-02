import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ui/ProgressBar';
import { Link } from 'react-router-dom';
import { Award, Clock, BookOpen, Calendar } from 'lucide-react';

interface EnrolledCourse {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    level: string;
  };
  progress: number;
  startDate: string;
  lastAccessDate: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalCompleted: 0,
    inProgress: 0,
    notStarted: 0
  });

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:8080/api/progress', {
          headers: {
            'x-auth-token': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch enrolled courses');
        }

        const data = await response.json();
        setEnrolledCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      const completed = enrolledCourses.filter(course => course.progress === 100).length;
      const notStarted = enrolledCourses.filter(course => course.progress === 0).length;
      const inProgress = enrolledCourses.length - completed - notStarted;
      
      setStatistics({
        totalCompleted: completed,
        inProgress: inProgress,
        notStarted: notStarted
      });
    }
  }, [enrolledCourses]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl text-primary-600 font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
            <div className="mb-2 text-primary-600">
              <BookOpen size={24} />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1 text-center">Total Enrolled</h3>
            <p className="text-3xl font-bold text-primary-600">{enrolledCourses.length}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
            <div className="mb-2 text-green-600">
              <Award size={24} />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1 text-center">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{statistics.totalCompleted}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
            <div className="mb-2 text-yellow-600">
              <Clock size={24} />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1 text-center">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">{statistics.inProgress}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
            <div className="mb-2 text-blue-600">
              <Calendar size={24} />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1 text-center">Not Started</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.notStarted}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Overall Learning Progress</h3>
          <ProgressBar 
            progress={totalProgress} 
            height={12} 
            showPercentage={true}
            color={totalProgress < 30 ? 'bg-red-500' : totalProgress < 70 ? 'bg-yellow-500' : 'bg-green-500'}
          />
          <div className="mt-2 text-sm text-gray-600">
            {totalProgress < 30 ? 'Just getting started! Keep going!' : 
             totalProgress < 70 ? 'You\'re making good progress!' : 
             totalProgress < 100 ? 'Almost there! Keep up the great work!' : 
             'Congratulations on completing all your courses!'}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>

      {enrolledCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="inline-block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((enrolledCourse) => (
            <div key={enrolledCourse._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={enrolledCourse.course.thumbnail} 
                alt={enrolledCourse.course.title} 
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{enrolledCourse.course.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {enrolledCourse.course.level}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${
                      enrolledCourse.progress === 0 ? 'text-gray-500' : 
                      enrolledCourse.progress < 25 ? 'text-red-600' : 
                      enrolledCourse.progress < 75 ? 'text-yellow-600' : 
                      enrolledCourse.progress < 100 ? 'text-blue-600' : 
                      'text-green-600'
                    }`}>
                      {enrolledCourse.progress === 0 ? 'Not Started' : 
                      enrolledCourse.progress < 25 ? 'Just Started' : 
                      enrolledCourse.progress < 75 ? 'In Progress' : 
                      enrolledCourse.progress < 100 ? 'Almost Complete' : 
                      'Completed'}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{enrolledCourse.progress}%</span>
                  </div>
                  <ProgressBar 
                    progress={enrolledCourse.progress} 
                    color={
                      enrolledCourse.progress < 25 ? 'bg-red-500' : 
                      enrolledCourse.progress < 75 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }
                  />
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p>Started: {new Date(enrolledCourse.startDate).toLocaleDateString()}</p>
                  <p>Last accessed: {new Date(enrolledCourse.lastAccessDate).toLocaleDateString()}</p>
                </div>
                
                <Link 
                  to={`/courses/${enrolledCourse.course._id}`} 
                  className="block w-full text-center bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
                >
                  {enrolledCourse.progress === 0 ? 'Start Course' : 
                   enrolledCourse.progress === 100 ? 'Review Course' : 
                   'Continue Learning'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
