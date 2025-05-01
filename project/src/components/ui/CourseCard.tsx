import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  
  // Calculate total lessons and duration
  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  
  const totalDuration = course.modules.reduce((sum, module) => {
    return sum + module.lessons.reduce((lessonSum, lesson) => {
      const [minutes, seconds] = lesson.duration.split(':').map(Number);
      return lessonSum + minutes + (seconds / 60);
    }, 0);
  }, 0);
  
  const formattedDuration = `${Math.floor(totalDuration)}h ${Math.round((totalDuration % 1) * 60)}m`;

  return (
    <div 
      className="card overflow-hidden transition-all duration-300 hover:translate-y-[-5px]"
      onClick={() => navigate(`/courses/${course.id}`)}
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
      </div>
    </div>
  );
};

export default CourseCard;