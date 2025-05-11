import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock, CheckCircle, Youtube } from 'lucide-react';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Calculate total lessons and duration safely
  const totalLessons = course.modules ? 
    course.modules.reduce((sum, module) => sum + module.lessons.length, 0) : 0;
  
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

  // Handle card click based on authentication status
  const handleCardClick = () => {
    if (isAuthenticated) {
      navigate(`/courses/${course._id}`);
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
          src={course.thumbnail || 'https://placehold.co/640x360/2563eb/ffffff?text=Course+Thumbnail'} 
          alt={course.title}
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
        {course.videoUrl && (
          <div className="absolute top-2 right-2">
            <Youtube className="h-6 w-6 text-red-600 bg-white rounded-full p-1" />
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