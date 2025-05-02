import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Extract video ID if it's a full YouTube URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url;
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

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md bg-black">
      <iframe
        className="w-full h-full"
        src={getEmbedUrl(videoUrl)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoPlayer;