import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock, CheckCircle, Youtube } from 'lucide-react';
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
  
  // Calculate total lessons and duration safely
  const totalLessons = course.modules ? 
    course.modules.reduce((sum, module) => sum + module.lessons.length, 0) : 
    course.lessonsCount || 0;
  
  const formattedDuration = course.modules ? 
    (() => {
      const totalDuration = course.modules.reduce((sum, module) => {
        return sum + module.lessons.reduce((lessonSum, lesson) => {
          const [minutes, seconds] = lesson.duration.split(':').map(Number);
          return lessonSum + minutes + (seconds / 60);
        }, 0);
      }, 0);
      return `${Math.floor(totalDuration)}h ${Math.round((totalDuration % 1) * 60)}m`;
    })() : 
    course.duration || '1h 30m';

  // Fetch course progress from local storage if available
  useEffect(() => {
    if (isAuthenticated && course.id) {
      const mockProgressKey = `mock-progress-${course.id}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      
      if (storedProgress && totalLessons > 0) {
        try {
          const mockData = JSON.parse(storedProgress);
          if (mockData.completedLessons) {
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
    
    // For courses without modules or with progress, return a default
    if (!course.modules) return "Continue Learning";
    
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
      console.error('Error getting resume text:', err);
    }
    
    return "Continue Learning";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.02] cursor-pointer" onClick={handleCardClick}>
      <div className="relative">
        <img 
          src={course.thumbnail || "https://via.placeholder.com/640x360?text=Course+Image"} 
          alt={course.title} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/640x360?text=Course+Image";
          }}
        />
        {course.videoUrl && (
          <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full" title="Includes video content">
            <Youtube size={16} />
          </div>
        )}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
            <div 
              className={`h-full ${progress < 25 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2 flex items-center text-amber-500">
          <Star className="fill-current w-4 h-4 mr-1" />
          <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
          
          <div className="ml-auto flex items-center text-gray-500 text-xs">
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
              course.level === 'beginner' ? 'bg-green-100 text-green-800' :
              course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 mb-1.5 text-lg leading-tight">{course.title}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{course.description}</p>
        
        <div className="text-xs text-gray-500 flex items-center mt-auto">
          <span className="flex items-center mr-3">
            <Users className="w-3 h-3 mr-1" />
            {course.studentsCount || 0} students
          </span>
          
          <span className="flex items-center mr-3">
            <CheckCircle className="w-3 h-3 mr-1" />
            {totalLessons} lessons
          </span>
          
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formattedDuration}
          </span>
        </div>
        
        <div className="mt-4">
          <button className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition">
            {getResumeText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;