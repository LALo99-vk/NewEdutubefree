import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProgressData {
  completedLessons: string[];
  watchProgress: Record<string, number>;
}

interface UseProgressTrackingResult {
  progress: number;
  isCompleted: boolean;
  completedLessons: string[];
  nextLessonId: string | null;
  markLessonAsComplete: (lessonId: string) => void;
  updateWatchProgress: (lessonId: string, percentage: number) => void;
}

/**
 * Custom hook for tracking progress across courses
 * This provides a consistent interface for all components to use
 */
export const useProgressTracking = (
  courseId: string | undefined,
  totalLessons: number = 1,
  availableLessons: Array<{ id: string, moduleId?: string }> = []
): UseProgressTrackingResult => {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  
  // Load progress data from localStorage or API
  useEffect(() => {
    if (!courseId || !isAuthenticated) return;
    
    const loadProgressData = () => {
      try {
        const mockProgressKey = `mock-progress-${courseId}`;
        const storedProgress = localStorage.getItem(mockProgressKey);
        
        if (storedProgress) {
          const mockData = JSON.parse(storedProgress) as ProgressData;
          
          // Set completed lessons array
          if (mockData.completedLessons) {
            setCompletedLessons(mockData.completedLessons);
          }
          
          // Calculate overall progress with weight for partial completion
          if (totalLessons > 0) {
            let completedCount = mockData.completedLessons?.length || 0;
            let inProgressCount = 0;
            
            // Calculate partial credit for in-progress lessons
            if (mockData.watchProgress) {
              Object.keys(mockData.watchProgress).forEach(lid => {
                if (!mockData.completedLessons.includes(lid) && mockData.watchProgress[lid] > 10) {
                  // Give partial credit based on actual watch percentage
                  const watchPercent = mockData.watchProgress[lid];
                  inProgressCount += (watchPercent / 100);
                }
              });
            }
            
            // Calculate overall course progress
            const weightedProgress = completedCount + inProgressCount;
            const progressPercentage = Math.round((weightedProgress / totalLessons) * 100);
            
            setProgress(progressPercentage);
            setIsCompleted(progressPercentage === 100);
          }
          
          // Find the next lesson that hasn't been completed
          if (availableLessons.length > 0) {
            const nextLesson = availableLessons.find(
              lesson => !mockData.completedLessons.includes(lesson.id)
            );
            
            if (nextLesson) {
              setNextLessonId(nextLesson.id);
            } else {
              setNextLessonId(null);
            }
          }
        } else {
          // No progress data yet
          setProgress(0);
          setIsCompleted(false);
          setCompletedLessons([]);
          
          // Set first lesson as next if no progress data
          if (availableLessons.length > 0) {
            setNextLessonId(availableLessons[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading progress data:', err);
      }
    };
    
    loadProgressData();
  }, [courseId, isAuthenticated, totalLessons, availableLessons]);
  
  // Mark a lesson as complete
  const markLessonAsComplete = (lessonId: string) => {
    if (!courseId || !lessonId) return;
    
    try {
      const mockProgressKey = `mock-progress-${courseId}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      let progressData: ProgressData;
      
      if (storedProgress) {
        progressData = JSON.parse(storedProgress);
        
        // Add to completed lessons if not already there
        if (!progressData.completedLessons.includes(lessonId)) {
          progressData.completedLessons.push(lessonId);
        }
        
        // Ensure watch progress is set to 100%
        if (!progressData.watchProgress) {
          progressData.watchProgress = {};
        }
        progressData.watchProgress[lessonId] = 100;
      } else {
        // Initialize new progress data
        progressData = {
          completedLessons: [lessonId],
          watchProgress: { [lessonId]: 100 }
        };
      }
      
      // Save updated progress data
      localStorage.setItem(mockProgressKey, JSON.stringify(progressData));
      
      // Update state
      setCompletedLessons(progressData.completedLessons);
      
      // Calculate new progress percentage
      if (totalLessons > 0) {
        let inProgressCount = 0;
        
        // Calculate partial credit for in-progress lessons
        Object.keys(progressData.watchProgress).forEach(lid => {
          if (!progressData.completedLessons.includes(lid) && progressData.watchProgress[lid] > 10) {
            // Give partial credit based on actual watch percentage
            const watchPercent = progressData.watchProgress[lid];
            inProgressCount += (watchPercent / 100);
          }
        });
        
        // Calculate overall course progress
        const weightedProgress = progressData.completedLessons.length + inProgressCount;
        const progressPercentage = Math.round((weightedProgress / totalLessons) * 100);
        
        setProgress(progressPercentage);
        setIsCompleted(progressPercentage === 100);
      }
      
      // Update next lesson
      if (availableLessons.length > 0) {
        const nextLesson = availableLessons.find(
          lesson => !progressData.completedLessons.includes(lesson.id)
        );
        
        if (nextLesson) {
          setNextLessonId(nextLesson.id);
        } else {
          setNextLessonId(null);
        }
      }
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
    }
  };
  
  // Update watch progress for a lesson
  const updateWatchProgress = (lessonId: string, percentage: number) => {
    if (!courseId || !lessonId) return;
    
    try {
      const mockProgressKey = `mock-progress-${courseId}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      let progressData: ProgressData;
      
      if (storedProgress) {
        progressData = JSON.parse(storedProgress);
        
        // Initialize watch progress if needed
        if (!progressData.watchProgress) {
          progressData.watchProgress = {};
        }
        
        // Update watch percentage
        progressData.watchProgress[lessonId] = percentage;
        
        // Auto-complete if watched 95% or more
        if (percentage >= 95 && !progressData.completedLessons.includes(lessonId)) {
          progressData.completedLessons.push(lessonId);
        }
      } else {
        // Initialize new progress data
        progressData = {
          completedLessons: percentage >= 95 ? [lessonId] : [],
          watchProgress: { [lessonId]: percentage }
        };
      }
      
      // Save updated progress data
      localStorage.setItem(mockProgressKey, JSON.stringify(progressData));
      
      // Update state
      setCompletedLessons(progressData.completedLessons);
      
      // Calculate new progress percentage
      if (totalLessons > 0) {
        let inProgressCount = 0;
        
        // Calculate partial credit for in-progress lessons
        Object.keys(progressData.watchProgress).forEach(lid => {
          if (!progressData.completedLessons.includes(lid) && progressData.watchProgress[lid] > 10) {
            // Give partial credit based on actual watch percentage
            const watchPercent = progressData.watchProgress[lid];
            inProgressCount += (watchPercent / 100);
          }
        });
        
        // Calculate overall course progress
        const weightedProgress = progressData.completedLessons.length + inProgressCount;
        const progressPercentage = Math.round((weightedProgress / totalLessons) * 100);
        
        setProgress(progressPercentage);
        setIsCompleted(progressPercentage === 100);
      }
      
      // Update next lesson if all completed
      if (availableLessons.length > 0 && percentage >= 95) {
        const nextLesson = availableLessons.find(
          lesson => !progressData.completedLessons.includes(lesson.id)
        );
        
        if (nextLesson) {
          setNextLessonId(nextLesson.id);
        } else {
          setNextLessonId(null);
        }
      }
    } catch (err) {
      console.error('Error updating watch progress:', err);
    }
  };
  
  return {
    progress,
    isCompleted,
    completedLessons,
    nextLessonId,
    markLessonAsComplete,
    updateWatchProgress
  };
};
