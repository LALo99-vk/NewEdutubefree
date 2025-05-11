import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, CheckCircle, Clock, BookOpen, Star, 
  ChevronRight,
  Users,
  Download,
  FileText
} from 'lucide-react';
import { Course, Lesson } from '../../types';
import VideoPlayer from '../../components/ui/VideoPlayer';
import VideoPlaceholder from '../../components/ui/VideoPlaceholder';

const MIN_WATCH_PERCENTAGE = 90; // Minimum percentage of video that must be watched

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [totalLessons, setTotalLessons] = useState(0);
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Listen for messages from the YouTube iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from YouTube
      if (event.origin !== 'https://www.youtube.com') return;

      try {
        const data = JSON.parse(event.data);
        
        // Handle video state changes
        if (data.event === 'onStateChange') {
          // Video ended (state = 0)
          if (data.info === 0 && currentLesson) {
            markLessonAsComplete(currentLesson._id);
          }
        }
        // Handle video progress
        else if (data.event === 'onReady') {
          setIsVideoReady(true);
        }
      } catch (error) {
        console.error('Error processing YouTube message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentLesson]);

  // Track video progress
  useEffect(() => {
    if (!currentLesson || !isVideoReady) return;

    const interval = setInterval(() => {
      if (iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'listening' }),
          'https://www.youtube.com'
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentLesson, isVideoReady]);

  // Mark lesson as complete
  const markLessonAsComplete = (lessonId: string) => {
    if (!lessonId) return;
    
    const newCompletedLessons = new Set(completedLessons);
    newCompletedLessons.add(lessonId);
    setCompletedLessons(newCompletedLessons);
    
    // Save progress to localStorage
    if (course?._id) {
      localStorage.setItem(`course-progress-${course._id}`, JSON.stringify({
        completedLessons: Array.from(newCompletedLessons),
        lessonProgress
      }));
    }
  };

  // Calculate overall course progress
  useEffect(() => {
    if (!course?.modules) return;

    let totalProgress = 0;
    let totalLessons = 0;

    course.modules.forEach(module => {
      module.lessons?.forEach(lesson => {
        totalLessons++;
        const progress = completedLessons.has(lesson._id) ? 100 : 
          (lessonProgress[lesson._id] || 0);
        totalProgress += progress;
      });
    });

    const overallProgress = totalLessons > 0 ? 
      Math.round(totalProgress / totalLessons) : 0;
    
    setCourseProgress(overallProgress);
    setTotalLessons(totalLessons);
  }, [course, completedLessons, lessonProgress]);

  // Load saved progress
  useEffect(() => {
    if (!course?._id) return;

    const savedProgress = localStorage.getItem(`course-progress-${course._id}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCompletedLessons(new Set(parsed.completedLessons));
        setLessonProgress(parsed.lessonProgress || {});
      } catch (e) {
        console.error('Error loading saved progress:', e);
      }
    }
  }, [course]);
  
  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        setCourse(data);
          
          // Calculate total lessons
        const lessons = data.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
          setTotalLessons(lessons);
          
        // Set the first lesson as current
        if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
          setCurrentLesson(data.modules[0].lessons[0]);
          setExpandedModules(new Set([data.modules[0]._id]));
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadCourse();
    }
  }, [id]);
  
  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    // Find the module of this lesson and expand it
    if (!course || !course.modules) return;
    
    for (const module of course.modules) {
      if (module.lessons.some(l => l._id === lesson._id)) {
        const newExpandedModules = new Set(expandedModules);
        newExpandedModules.add(module._id);
        setExpandedModules(newExpandedModules);
        break;
      }
    }
    
    // Scroll to top for mobile users
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const toggleModule = (moduleId: string) => {
    const newExpandedModules = new Set(expandedModules);
    if (newExpandedModules.has(moduleId)) {
      newExpandedModules.delete(moduleId);
    } else {
      newExpandedModules.add(moduleId);
    }
    setExpandedModules(newExpandedModules);
  };
  
  // Format YouTube URL for embedding
  const formatYoutubeUrl = (url: string): string => {
    if (!url) {
      console.log('No URL provided');
      return '';
    }
    
    console.log('Processing URL:', url);
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    
    try {
    // Handle youtube.com/watch?v= URLs
    if (url.includes('youtube.com/watch?v=')) {
        const urlParams = new URL(url);
        videoId = urlParams.searchParams.get('v') || '';
    }
    // Handle youtu.be/ shortened URLs
      else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      // Handle youtube.com/embed/ URLs
      else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
    }
    // If it's just a video ID
      else if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
        videoId = url;
      }
      
      // Validate video ID
      if (videoId && videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        console.log('Generated embed URL:', embedUrl);
        return embedUrl;
      } else {
        console.log('Invalid video ID format:', videoId);
        return '';
      }
    } catch (error) {
      console.error('Error processing YouTube URL:', error);
      return '';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
              onClick={() => navigate('/courses')}
            >
              Browse all courses
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/courses" className="text-gray-500 hover:text-gray-700">Courses</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{course.title}</span>
          </div>
        </div>
      </div>
      
      {/* Course header */}
      <div className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center">
              <span className="flex items-center"><Star className="h-5 w-5 text-yellow-400 mr-1" fill="currentColor" /> {course.rating}</span>
              <span className="mx-2">•</span>
              <span>{course.totalStudents || 0} students</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2">
            {/* Video player */}
            <div ref={videoRef} className="relative rounded-lg overflow-hidden shadow-lg max-w-3xl mx-auto">
              {(currentLesson?.videoUrl || course?.videoUrl) ? (
                <VideoPlayer
                  videoUrl={currentLesson?.videoUrl || course?.videoUrl || ''}
                    title={currentLesson?.title || course?.title || ''}
                  courseId={course?._id}
                  lessonId={currentLesson?._id}
                  totalLessons={totalLessons}
                  onNextLesson={() => {
                    // Find next lesson
                    if (!course?.modules || !currentLesson) return;
                    
                    let foundCurrent = false;
                    for (const module of course.modules) {
                      for (let i = 0; i < module.lessons.length; i++) {
                        if (foundCurrent && i < module.lessons.length) {
                          // Found next lesson
                          setCurrentLesson(module.lessons[i]);
                          return;
                        }
                        if (module.lessons[i]._id === currentLesson._id) {
                          foundCurrent = true;
                        }
                      }
                    }
                  }}
                  availableLessons={course?.modules?.flatMap(module => 
                    module.lessons.map(lesson => ({
                      id: lesson._id,
                      moduleId: module._id
                    }))
                  ) || []}
                  />
              ) : (
                <VideoPlaceholder 
                  title="No video available for this lesson" 
                  progress={courseProgress}
                />
              )}
            </div>
            
            {/* Current lesson title and description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">{currentLesson?.title || 'Course Overview'}</h2>
              <p className="text-gray-600">
                {currentLesson?.description || course.description}
              </p>
              <div className="flex items-center mt-2 text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {currentLesson?.duration || '15:20'}
              </div>
            </div>

            {course.studyMaterial && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Study Material
                </h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{course.studyMaterial.fileName}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded on {new Date(course.studyMaterial.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={course.studyMaterial.fileUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Right sidebar - Course Content */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Course Content</h3>
              <button 
                onClick={() => setExpandedModules(new Set(course?.modules?.map(m => m._id) || []))}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Expand all
              </button>
            </div>
            
            {course?.modules?.map((module) => (
              <div key={module._id} className="mb-3 border-b border-gray-100 pb-2 last:border-0">
                <div 
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => toggleModule(module._id)}
                >
                  <div className="flex items-center">
                    <ChevronRight 
                      className={`h-4 w-4 mr-2 transition-transform ${expandedModules.has(module._id) ? 'transform rotate-90' : ''}`}
                    />
                    <h4 className="font-medium">{module.title}</h4>
                  </div>
                  <div className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</div>
                </div>
                
                {expandedModules.has(module._id) && (
                  <div className="pl-6 py-1">
                    {module.lessons?.map((lesson) => (
                      <div 
                        key={lesson._id}
                        className={`py-2 flex items-start cursor-pointer ${lesson._id === currentLesson?._id ? 'bg-blue-50 -mx-2 px-2 rounded' : ''}`}
                        onClick={() => handleLessonSelect(lesson)}
                      >
                        <div className="flex-shrink-0 mr-3 mt-1">
                          {completedLessons.has(lesson._id) ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Play className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-medium">{lesson.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {lesson.duration}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;