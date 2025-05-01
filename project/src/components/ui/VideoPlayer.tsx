import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
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