import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { useProgressTracking } from '../../hooks/useProgressTracking';

// Define YouTube player event interfaces
interface YouTubePlayerEvent {
  target: any;
  data?: number;
}

// Declare YouTube as a global variable
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  courseId?: string;
  lessonId?: string;
  totalLessons?: number;
  onNextLesson?: () => void;
  availableLessons?: Array<{ id: string, moduleId?: string }>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  courseId,
  lessonId,
  totalLessons = 1,
  onNextLesson,
  availableLessons = []
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [watchPercentage, setWatchPercentage] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Use our centralized progress tracking hook
  const {
    progress,
    isCompleted,
    updateWatchProgress,
    markLessonAsComplete
  } = useProgressTracking(
    courseId,
    totalLessons,
    availableLessons
  );

  // Extract video ID if it's a full YouTube URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      // Return URL without parameters so we can control parameters ourselves
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url;
  };

  // Load YouTube API
  useEffect(() => {
    if (!window.YT || !window.YT.Player) {
      // Load the YouTube API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      // Setup the callback function
      window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
    } else if (!playerReady) {
      initializeYouTubePlayer();
    }
    
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoUrl]);

  // Initialize YouTube Player
  const initializeYouTubePlayer = () => {
    if (!playerRef.current) return;
    
    const videoId = getEmbedUrl(videoUrl);
    if (!videoId) return;
    
    try {
      // Clean up existing player if any
      if (youtubePlayer) {
        setYoutubePlayer(null);
      }
      
      // Create new player instance
      const player = new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
      
      setYoutubePlayer(player);
    } catch (err) {
      console.error('Error initializing YouTube player:', err);
      setError('Failed to load video player');
    }
  };

  const onPlayerReady = (event: YouTubePlayerEvent) => {
    setPlayerReady(true);
    setDuration(event.target.getDuration());
  };

  const onPlayerStateChange = (event: YouTubePlayerEvent) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!progressIntervalRef.current) {
        startProgressTracking();
      }
    } else if (event.data === window.YT.PlayerState.ENDED) {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      // Mark the video as completed when it ends
      if (!isCompleted && courseId && lessonId) {
        updateProgress();
      }
    }
  };

  const startProgressTracking = () => {
    const updateInterval = 1000; // Update every second
    
    const updateVideoProgress = () => {
      try {
        const currentTime = youtubePlayer.getCurrentTime() || 0;
        const duration = youtubePlayer.getDuration() || 0;
        
        if (duration > 0) {
          setCurrentTime(currentTime);
          setDuration(duration);
          
          // Calculate watch percentage
          const percentage = Math.floor((currentTime / duration) * 100);
          setWatchPercentage(percentage);
          
          // Update watch progress in our tracking system
          if (courseId && lessonId) {
            updateWatchProgress(lessonId, percentage);
          }
        }
      } catch (err) {
        console.error('Error updating video progress:', err);
      }
    };
    
    // Setup interval for updating progress
    const intervalId = window.setInterval(updateVideoProgress, updateInterval);
    progressIntervalRef.current = intervalId;
  };

  // Update progress in backend
  const updateProgress = async () => {
    if (!courseId || !lessonId || isCompleted || isUpdating) return;
    setIsUpdating(true);
    
    try {
      // Mark the lesson as complete using our tracking system
      markLessonAsComplete(lessonId);
      console.log(`Lesson completed! Overall course progress: ${progress}%`);
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // If user is not authenticated, show login prompt instead of video
  if (!isAuthenticated) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md bg-gray-100 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Login Required</h3>
          <p className="text-gray-600 mb-4">You need to be logged in to watch this video.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary mr-3"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-secondary"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Function to get the current lesson number and total lessons
  const getLessonInfo = () => {
    if (!courseId || !lessonId) return { current: 1, total: 1 };
    
    try {
      const mockProgressKey = `mock-progress-${courseId}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      
      if (storedProgress) {
        const mockData = JSON.parse(storedProgress);
        const completedCount = mockData.completedLessons.length;
        const inProgressLesson = isCompleted ? 0 : 1; // Count current lesson if not completed
        
        return {
          current: completedCount + inProgressLesson,
          total: totalLessons
        };
      }
    } catch (err) {
      console.error('Error getting lesson info:', err);
    }
    
    return { current: 1, total: totalLessons };
  };
  
  const lessonInfo = getLessonInfo();

  return (
    <div className="flex flex-col">
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md bg-black relative">
        <div id={`player-${courseId}-${lessonId}`} className="w-full h-full">
          <iframe
            ref={playerRef}
            className="w-full h-full"
            src={getEmbedUrl(videoUrl)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          ></iframe>
        </div>
        
        {/* Video progress overlay - minimal and unobtrusive */}
        {courseId && lessonId && watchPercentage > 0 && !isCompleted && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 bg-opacity-50"
            style={{ pointerEvents: 'none' }}
          >
            <div 
              className="h-full bg-primary-600 transition-all duration-300 ease-out"
              style={{ width: `${watchPercentage}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Udemy-style progress indicator - always shown when part of a course */}
      {courseId && lessonId && (
        <div className="mt-4 transition-all duration-300 ease-in-out">
          {error ? (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>
          ) : null}

          {/* Course progress header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              {isCompleted ? "Completed" : "Your Progress"}
            </h3>
            <span className="text-sm text-gray-600">
              {lessonInfo.current} of {lessonInfo.total} lessons
            </span>
          </div>

          {/* Udemy-style progress bar */}
          <div className={`${isCompleted ? 'scale-102 transform' : ''} transition-all duration-300`}>
            <ProgressBar 
              progress={progress} 
              height={10}
              color="bg-primary-600"
              showPercentage={false}
              className="mb-2"
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                  isCompleted ? "bg-green-500 text-white" : "border-2 border-gray-300"
                }`}>
                  {isCompleted && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {isCompleted 
                    ? "Lesson completed" 
                    : `${progress}% complete`
                  }
                </span>
              </div>
              
              {!isCompleted && (
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                    watchPercentage >= 80 
                      ? "bg-primary-600 text-white hover:bg-primary-700" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={watchPercentage < 80}
                  onClick={() => {
                    if (watchPercentage >= 80) {
                      updateProgress();
                    }
                  }}
                >
                  Mark as complete
                </button>
              )}
            </div>
          </div>

          {/* Next lesson button - only shown when current lesson is completed */}
          {isCompleted && lessonInfo.current < lessonInfo.total && (
            <div className="mt-4">
              <button 
                className="w-full py-2 px-4 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                onClick={() => {
                  if (onNextLesson) {
                    onNextLesson();
                  } else {
                    // This would typically navigate to the next lesson
                    // For now, we'll just log it
                    console.log('Navigate to next lesson');
                  }
                }}
              >
                Continue to Next Lesson
              </button>
            </div>
          )}
     </div>
      )}
    </div>
  );
};

export default VideoPlayer;