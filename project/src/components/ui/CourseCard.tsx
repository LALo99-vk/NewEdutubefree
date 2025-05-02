import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock, CheckCircle } from 'lucide-react';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [showProgress, setShowProgress] = useState<boolean>(false);
  
  // Calculate total lessons and duration
  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  
  const totalDuration = course.modules.reduce((sum, module) => {
    return sum + module.lessons.reduce((lessonSum, lesson) => {
      const [minutes, seconds] = lesson.duration.split(':').map(Number);
      return lessonSum + minutes + (seconds / 60);
    }, 0);
  }, 0);
  
  const formattedDuration = `${Math.floor(totalDuration)}h ${Math.round((totalDuration % 1) * 60)}m`;

  // Fetch course progress from local storage if available
  useEffect(() => {
    if (isAuthenticated && course.id) {
      const mockProgressKey = `mock-progress-${course.id}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      
      if (storedProgress) {
        try {
          const mockData = JSON.parse(storedProgress);
          if (mockData.completedLessons && totalLessons > 0) {
            // Calculate progress percentage
            const completedCount = mockData.completedLessons.length;
            
            // Calculate partial credit for in-progress lessons
            let inProgressCount = 0;
            if (mockData.watchProgress) {
              Object.keys(mockData.watchProgress).forEach(lid => {
                if (!mockData.completedLessons.includes(lid) && mockData.watchProgress[lid] > 10) {
                  // Give partial credit based on actual watch percentage
                  const watchPercent = mockData.watchProgress[lid];
                  inProgressCount += (watchPercent / 100);
                }
              });
            }
            
            // Calculate overall progress with partial credit
            const weightedProgress = completedCount + inProgressCount;
            const progressPercentage = Math.round((weightedProgress / totalLessons) * 100);
            
            setProgress(progressPercentage);
            setShowProgress(true);
          }
        } catch (err) {
          console.error('Error parsing progress data:', err);
        }
      }
    }
  }, [isAuthenticated, course.id, totalLessons]);

  // Handle card click based on authentication status
  const handleCardClick = () => {
    if (isAuthenticated) {
      navigate(`/courses/${course.id}`);
    } else {
      navigate('/login', { state: { redirectTo: `/courses/${course.id}` } });
    }
  };

  // Find the next incomplete lesson for this course
  const getResumeText = () => {
    if (progress === 0) return "Start Course";
    if (progress === 100) return "Review Course";
    
    // Find the next incomplete lesson
    try {
      const mockProgressKey = `mock-progress-${course.id}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      
      if (storedProgress) {
        const mockData = JSON.parse(storedProgress);
        const { completedLessons = [] } = mockData;
        
        // Find the first module with an incomplete lesson
        for (const module of course.modules) {
          for (const lesson of module.lessons) {
            if (!completedLessons.includes(lesson.id)) {
              return "Continue Learning";
            }
          }
        }
      }
    } catch (err) {
      console.error('Error finding next lesson:', err);
    }
    
    return "Continue Learning";
  };

  return (
    <div 
      className="card overflow-hidden transition-all duration-300 hover:translate-y-[-5px]"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="h-48 w-full object-cover"
        />
        {course.featured && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-primary-500 text-white">Featured</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="badge bg-white text-gray-800">
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
        </div>
        
        {/* Progress indicator overlay */}
        {showProgress && progress > 0 && (
          <div className="absolute top-3 left-3 flex items-center bg-black bg-opacity-70 px-2 py-1 rounded-md">
            {progress === 100 ? (
              <div className="flex items-center text-green-400">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Completed</span>
              </div>
            ) : (
              <div className="flex items-center text-white">
                <span className="text-xs font-medium">{progress}% Complete</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="badge badge-primary">{course.category}</span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
        <div className="text-sm text-gray-500 mb-3">Instructor: {course.instructor}</div>
        
        {/* Show progress bar for enrolled courses */}
        {showProgress && (
          <div className="mb-3">
            <ProgressBar 
              progress={progress} 
              height={4}
              color={progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500'}
              showPercentage={false}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.totalStudents.toLocaleString()} students</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{totalLessons} lessons · {formattedDuration}</span>
          </div>
        </div>
        
        {/* Continue or Start button for authenticated users */}
        {isAuthenticated && (
          <button 
            className="mt-3 w-full py-2 px-4 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${course.id}`);
            }}
          >
            {getResumeText()}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;