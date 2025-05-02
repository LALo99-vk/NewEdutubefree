import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  className?: string;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = 'bg-primary-600',
  className = '',
  showPercentage = true,
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">{normalizedProgress}%</span>
        )}
      </div>
      <div 
        className="w-full bg-gray-200 rounded-full overflow-hidden" 
        style={{ height: `${height}px` }}
      >
        <div
          className={`${color} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${normalizedProgress}%`, height: '100%' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
