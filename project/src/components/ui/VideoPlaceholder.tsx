import React from 'react';
import { BookOpen, Play, Volume2, Settings, Maximize } from 'lucide-react';

interface VideoPlaceholderProps {
  title?: string;
  progress?: number; // Progress value between 0-100
}

const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({ 
  title = 'No video available for this lesson',
  progress = 0
}) => {
  return (
    <div className="aspect-w-16 aspect-h-9 bg-black relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="rounded-full bg-gray-700 p-4 mb-4">
          <BookOpen className="h-12 w-12 text-gray-300" />
        </div>
        <p className="text-gray-300 text-lg mb-2">{title}</p>
        <p className="text-gray-400 text-sm">This content may be text-based or currently unavailable</p>
      </div>
      
      {/* YouTube-like control bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] h-12 flex items-center px-4">
        <div className="flex items-center space-x-3">
          <button className="text-gray-300 hover:text-white transition-colors">
            <Play size={22} />
          </button>
          <div className="text-gray-400 text-xs">0:00 / 0:00</div>
        </div>
        
        <div className="flex-grow mx-4 relative">
          {/* Background progress bar */}
          <div className="h-1 w-full bg-gray-700 rounded-full"></div>
          
          {/* Actual progress bar */}
          <div 
            className="h-1 bg-red-600 rounded-full absolute top-0 left-0 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
          
          {/* Buffer progress indicator */}
          <div 
            className="h-1 bg-gray-600 rounded-full absolute top-0 left-0 opacity-50" 
            style={{ width: `${Math.min(progress + 30, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="text-gray-300 hover:text-white transition-colors">
            <Volume2 size={20} />
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlaceholder;
