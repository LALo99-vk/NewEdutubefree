import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock, Youtube, Bookmark, Play } from 'lucide-react';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [courseProgress, setCourseProgress] = useState(0);
  const [lastCheckpoint, setLastCheckpoint] = useState<string | null>(null);

  // Calculate total lessons for progress calculation
  const totalLessons = course.modules ? 
    course.modules.reduce((sum, module) => sum + module.lessons.length, 0) : 0;

  // Load course progress and checkpoint on mount
  useEffect(() => {
    if (course._id) {
      const progressKey = `mock-progress-${course._id}`;
      const checkpointKey = `checkpoint-${course._id}`;
      
      // Load progress
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        try {
          const data = JSON.parse(savedProgress);
          const completedLessons = data.completedLessons?.length || 0;
          setCourseProgress(Math.round((completedLessons / totalLessons) * 100));
        } catch (err) {
          console.error('Error loading progress:', err);
        }
      }
      
      // Load checkpoint
      const savedCheckpoint = localStorage.getItem(checkpointKey);
      if (savedCheckpoint) {
        setLastCheckpoint(savedCheckpoint);
      }
    }
  }, [course._id, totalLessons]);
  
  const formattedDuration = course.modules ? 
    (() => {
      const totalDuration = course.modules.reduce((sum, module) => {
        return sum + module.lessons.reduce((lessonSum, lesson) => {
          const [minutes, seconds] = lesson.duration.split(':').map(Number);
          return lessonSum + minutes + (seconds / 60);
        }, 0);
      }, 0);
      return `${Math.floor(totalDuration)}h ${Math.round((totalDuration % 1) * 60)}m`;
    })() : '1h 30m';

  // Handle checkpoint save
  const handleSaveCheckpoint = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (course._id) {
      const checkpointKey = `checkpoint-${course._id}`;
      const currentTime = new Date().toISOString();
      localStorage.setItem(checkpointKey, currentTime);
      setLastCheckpoint(currentTime);
    }
  };

  // Handle card click based on authentication status
  const handleCardClick = () => {
    if (isAuthenticated) {
      navigate(`/courses/${course._id}${lastCheckpoint ? `?checkpoint=${lastCheckpoint}` : ''}`);
    } else {
      navigate('/login', { state: { redirectTo: `/courses/${course._id}` } });
    }
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/640x360/2563eb/ffffff?text=Course+Thumbnail';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img 
          src={course.thumbnail || `https://placehold.co/640x360/2563eb/ffffff?text=${encodeURIComponent(course.title)}`}
          alt={course.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/640x360/2563eb/ffffff?text=${encodeURIComponent(course.title)}`;
          }}
        />
        {course.videoUrl && (
          <div className="absolute top-2 right-2">
            <Youtube className="h-6 w-6 text-red-600 bg-white rounded-full p-1" />
          </div>
        )}
        
        {/* Progress overlay on thumbnail */}
        {isAuthenticated && courseProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <div className="flex items-center justify-between text-white text-sm mb-1">
              <span>Your Progress</span>
              <span>{courseProgress}%</span>
            </div>
            <div className="h-1 bg-gray-600 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  courseProgress < 30 ? 'bg-red-500' : 
                  courseProgress < 70 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {course.category.name}
          </span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {course.level}
          </span>
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        {/* Continue Learning Button - Only show for authenticated users with progress */}
        {isAuthenticated && courseProgress > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${course._id}${lastCheckpoint ? `?checkpoint=${lastCheckpoint}` : ''}`);
            }}
            className="w-full mb-4 flex items-center justify-center gap-2 text-sm text-white bg-primary-600 hover:bg-primary-700 px-3 py-2 rounded transition-colors"
          >
            <Play className="h-4 w-4" />
            Continue Learning
          </button>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span>{course.rating || 0}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.totalStudents || 0}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formattedDuration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;