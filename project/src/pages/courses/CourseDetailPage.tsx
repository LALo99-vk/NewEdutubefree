import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, CheckCircle, Clock, Users, BookOpen, Star, 
  ChevronDown, ChevronRight, ChevronUp
} from 'lucide-react';
import { courses } from '../../data/mockData';
import VideoPlayer from '../../components/ui/VideoPlayer';
import { Course, Lesson } from '../../types';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundCourse = courses.find(c => c.id === id);
      if (foundCourse) {
        setCourse(foundCourse);
        // Set the first lesson as the current lesson
        if (foundCourse.modules.length > 0 && foundCourse.modules[0].lessons.length > 0) {
          setCurrentLesson(foundCourse.modules[0].lessons[0]);
          // Expand the first module by default
          setExpandedModules(new Set([foundCourse.modules[0].id]));
        }
      }
      setIsLoading(false);
    }, 500);
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Course not found</h1>
            <p className="text-gray-600 mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/courses')}
            >
              Browse all courses
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate total lessons and duration
  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  
  const totalDuration = course.modules.reduce((sum, module) => {
    return sum + module.lessons.reduce((lessonSum, lesson) => {
      const [minutes, seconds] = lesson.duration.split(':').map(Number);
      return lessonSum + minutes + (seconds / 60);
    }, 0);
  }, 0);
  
  const formattedDuration = `${Math.floor(totalDuration)}h ${Math.round((totalDuration % 1) * 60)}m`;
  
  const toggleModule = (moduleId: string) => {
    const newExpandedModules = new Set(expandedModules);
    if (newExpandedModules.has(moduleId)) {
      newExpandedModules.delete(moduleId);
    } else {
      newExpandedModules.add(moduleId);
    }
    setExpandedModules(newExpandedModules);
  };
  
  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    // Find the module of this lesson and expand it
    for (const module of course.modules) {
      if (module.lessons.some(l => l.id === lesson.id)) {
        const newExpandedModules = new Set(expandedModules);
        newExpandedModules.add(module.id);
        setExpandedModules(newExpandedModules);
        break;
      }
    }
    // Scroll to top for mobile users
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Find the next lesson after the current one
  const findNextLesson = (): Lesson | null => {
    if (!currentLesson || !course) return null;
    
    // Loop through all modules and their lessons
    for (const module of course.modules) {
      // Get the index of the current lesson in this module
      const lessonIndex = module.lessons.findIndex(lesson => lesson.id === currentLesson.id);
      
      if (lessonIndex !== -1) {
        // Check if there's a next lesson in this module
        if (lessonIndex < module.lessons.length - 1) {
          return module.lessons[lessonIndex + 1];
        }
        
        // This was the last lesson in the current module, look for the next module
        const moduleIndex = course.modules.findIndex(m => m.id === module.id);
        if (moduleIndex < course.modules.length - 1) {
          // There's a next module, return its first lesson
          const nextModule = course.modules[moduleIndex + 1];
          if (nextModule.lessons.length > 0) {
            return nextModule.lessons[0];
          }
        }
        
        // This was the last lesson in the last module
        return null;
      }
    }
    
    return null;
  };
  
  // Handle navigation to the next lesson
  const handleNextLesson = () => {
    const nextLesson = findNextLesson();
    if (nextLesson) {
      handleLessonSelect(nextLesson);
    }
  };
  
  // Generate a flat list of all lessons for progress tracking
  const getAllLessons = () => {
    if (!course) return [];
    
    const allLessons: Array<{id: string, moduleId: string}> = [];
    
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        allLessons.push({
          id: lesson.id,
          moduleId: module.id
        });
      });
    });
    
    return allLessons;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course video and info section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentLesson ? (
                <>
                  <VideoPlayer 
                    videoUrl={currentLesson.videoUrl} 
                    title={currentLesson.title}
                    courseId={course.id}
                    lessonId={currentLesson.id}
                    totalLessons={totalLessons}
                    onNextLesson={handleNextLesson}
                    availableLessons={getAllLessons()}
                  />
                  <div className="mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                    <p className="text-gray-600 mb-4">{currentLesson.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{currentLesson.duration}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No lesson selected</h3>
                    <p className="text-gray-600">Select a lesson from the course content to start learning.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-700">{course.rating.toFixed(1)}</span>
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="ml-1 text-sm text-gray-600">{course.totalStudents.toLocaleString()} students</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="badge badge-primary">{course.category}</span>
                    <span className="badge bg-gray-100 text-gray-800">
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Total duration: {formattedDuration}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Course Content</h3>
                    <button 
                      className="text-primary-600 text-sm flex items-center hover:text-primary-700"
                      onClick={() => {
                        if (expandedModules.size === course.modules.length) {
                          setExpandedModules(new Set());
                        } else {
                          setExpandedModules(new Set(course.modules.map(m => m.id)));
                        }
                      }}
                    >
                      {expandedModules.size === course.modules.length ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Collapse all
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Expand all
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {course.modules.map(module => (
                      <div key={module.id} className="border border-gray-200 rounded-md overflow-hidden">
                        <button
                          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                          onClick={() => toggleModule(module.id)}
                        >
                          <div className="flex items-center">
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                            )}
                            <span className="font-medium text-gray-900">{module.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{module.lessons.length} lessons</span>
                        </button>
                        
                        {expandedModules.has(module.id) && (
                          <div className="border-t border-gray-200">
                            {module.lessons.map(lesson => (
                              <button
                                key={lesson.id}
                                className={`w-full px-4 py-3 flex items-start hover:bg-gray-50 transition-colors ${
                                  currentLesson?.id === lesson.id ? 'bg-primary-50' : ''
                                }`}
                                onClick={() => handleLessonSelect(lesson)}
                              >
                                <div className={`flex-shrink-0 mt-0.5 ${
                                  currentLesson?.id === lesson.id ? 'text-primary-600' : 'text-gray-400'
                                }`}>
                                  {currentLesson?.id === lesson.id ? (
                                    <Play className="h-5 w-5" />
                                  ) : (
                                    <Play className="h-5 w-5" />
                                  )}
                                </div>
                                <div className="ml-3 text-left flex-1">
                                  <div className={`font-medium ${
                                    currentLesson?.id === lesson.id ? 'text-primary-700' : 'text-gray-900'
                                  }`}>
                                    {lesson.title}
                                  </div>
                                  <div className="flex items-center mt-1 text-sm text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this course</h2>
          <p className="text-gray-700 mb-6">{course.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What you'll learn</h3>
              <ul className="space-y-2">
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Master the fundamentals of {course.category}</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Build real-world projects with expert guidance</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Understand advanced concepts and best practices</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Prepare for professional work in the industry</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Course instructor</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {course.instructor.charAt(0)}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">{course.instructor}</h4>
                  <p className="text-sm text-gray-600 mt-1">Expert in {course.category}</p>
                  <button className="text-primary-600 text-sm mt-2 hover:text-primary-700">
                    View profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses
            .filter(c => c.category === course.category && c.id !== course.id)
            .slice(0, 3)
            .map(relatedCourse => (
              <div 
                key={relatedCourse.id}
                className="card cursor-pointer"
                onClick={() => navigate(`/courses/${relatedCourse.id}`)}
              >
                <img 
                  src={relatedCourse.thumbnail} 
                  alt={relatedCourse.title} 
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{relatedCourse.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{relatedCourse.instructor}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium">{relatedCourse.rating.toFixed(1)}</span>
                    </div>
                    <span className="badge badge-primary">{relatedCourse.level}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;