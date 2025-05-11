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
  watchProgress: Record<string, number>;
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
  const [watchProgress, setWatchProgress] = useState<Record<string, number>>({});
  
  // Load progress data from localStorage
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
          
          // Set watch progress
          if (mockData.watchProgress) {
            setWatchProgress(mockData.watchProgress);
          }
          
          // Calculate overall progress with improved weighting
          if (totalLessons > 0) {
            let weightedProgress = 0;
            
            // Calculate weighted progress for each lesson
            availableLessons.forEach(lesson => {
              const lessonId = lesson.id;
              const watchPercentage = mockData.watchProgress?.[lessonId] || 0;
              
              if (mockData.completedLessons?.includes(lessonId)) {
                // Completed lessons count as 100%
                weightedProgress += 1;
              } else if (watchPercentage >= 90) {
                // Lessons watched 90% or more count as 95%
                weightedProgress += 0.95;
              } else if (watchPercentage >= 50) {
                // Lessons watched 50% or more count as 75%
                weightedProgress += 0.75;
              } else if (watchPercentage > 0) {
                // Partially watched lessons count proportionally
                weightedProgress += (watchPercentage / 100) * 0.5;
              }
            });
            
            // Calculate final progress percentage
            const progressPercentage = Math.round((weightedProgress / totalLessons) * 100);
            setProgress(progressPercentage);
            setIsCompleted(progressPercentage >= 95); // Consider course complete at 95%
          }
          
          // Find next lesson
          if (availableLessons.length > 0) {
            const nextLesson = availableLessons.find(
              lesson => !mockData.completedLessons?.includes(lesson.id)
            );
            setNextLessonId(nextLesson?.id || null);
          }
        } else {
          // Initialize progress data
          setProgress(0);
          setIsCompleted(false);
          setCompletedLessons([]);
          setWatchProgress({});
          setNextLessonId(availableLessons[0]?.id || null);
        }
      } catch (err) {
        console.error('Error loading progress data:', err);
      }
    };
    
    loadProgressData();
  }, [courseId, isAuthenticated, totalLessons, availableLessons]);
  
  // Update watch progress with improved responsiveness
  const updateWatchProgress = (lessonId: string, percentage: number) => {
    if (!courseId || !lessonId) return;
    
    try {
      const mockProgressKey = `mock-progress-${courseId}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      let progressData: ProgressData = storedProgress ? JSON.parse(storedProgress) : {
        completedLessons: [],
        watchProgress: {}
      };
      
      // Update watch progress
      progressData.watchProgress = {
        ...progressData.watchProgress,
        [lessonId]: percentage
      };
      
      // Auto-complete lesson if watched enough
      if (percentage >= 90 && !progressData.completedLessons.includes(lessonId)) {
        progressData.completedLessons.push(lessonId);
      }
      
      // Save updated progress
      localStorage.setItem(mockProgressKey, JSON.stringify(progressData));
      
      // Update state immediately for better responsiveness
      setWatchProgress(progressData.watchProgress);
      setCompletedLessons(progressData.completedLessons);
      
      // Recalculate overall progress
      let weightedProgress = 0;
      availableLessons.forEach(lesson => {
        const lessonWatchPercentage = progressData.watchProgress[lesson.id] || 0;
        
        if (progressData.completedLessons.includes(lesson.id)) {
          weightedProgress += 1;
        } else if (lessonWatchPercentage >= 90) {
          weightedProgress += 0.95;
        } else if (lessonWatchPercentage >= 50) {
          weightedProgress += 0.75;
        } else if (lessonWatchPercentage > 0) {
          weightedProgress += (lessonWatchPercentage / 100) * 0.5;
        }
      });
      
      const newProgress = Math.round((weightedProgress / totalLessons) * 100);
      setProgress(newProgress);
      setIsCompleted(newProgress >= 95);
      
      // Update next lesson
      const nextLesson = availableLessons.find(
        lesson => !progressData.completedLessons.includes(lesson.id)
      );
      setNextLessonId(nextLesson?.id || null);
    } catch (err) {
      console.error('Error updating watch progress:', err);
    }
  };
  
  // Mark lesson as complete with immediate feedback
  const markLessonAsComplete = (lessonId: string) => {
    if (!courseId || !lessonId) return;
    
    try {
      const mockProgressKey = `mock-progress-${courseId}`;
      const storedProgress = localStorage.getItem(mockProgressKey);
      let progressData: ProgressData = storedProgress ? JSON.parse(storedProgress) : {
        completedLessons: [],
        watchProgress: {}
      };
      
      // Add to completed lessons if not already there
      if (!progressData.completedLessons.includes(lessonId)) {
        progressData.completedLessons.push(lessonId);
        progressData.watchProgress[lessonId] = 100;
      }
      
      // Save updated progress
      localStorage.setItem(mockProgressKey, JSON.stringify(progressData));
      
      // Update state immediately
      setCompletedLessons(progressData.completedLessons);
      setWatchProgress(progressData.watchProgress);
      
      // Recalculate progress
      let weightedProgress = progressData.completedLessons.length;
      availableLessons.forEach(lesson => {
        if (!progressData.completedLessons.includes(lesson.id)) {
          const watchPercentage = progressData.watchProgress[lesson.id] || 0;
          if (watchPercentage >= 90) {
            weightedProgress += 0.95;
          } else if (watchPercentage >= 50) {
            weightedProgress += 0.75;
          } else if (watchPercentage > 0) {
            weightedProgress += (watchPercentage / 100) * 0.5;
          }
        }
      });
      
      const newProgress = Math.round((weightedProgress / totalLessons) * 100);
      setProgress(newProgress);
      setIsCompleted(newProgress >= 95);
      
      // Update next lesson
      const nextLesson = availableLessons.find(
        lesson => !progressData.completedLessons.includes(lesson.id)
      );
      setNextLessonId(nextLesson?.id || null);
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
    }
  };
  
  return {
    progress,
    isCompleted,
    completedLessons,
    nextLessonId,
    watchProgress,
    markLessonAsComplete,
    updateWatchProgress
  };
};
