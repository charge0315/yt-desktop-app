import React, { useEffect, useRef } from 'react';

interface ShortsPlayerProps {
  shortId: string;
  onClose: () => void;
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ shortId, onClose }) => {
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="shorts-player-modal" onClick={handleBackdropClick}>
      <div className="shorts-player-container">
        <button className="shorts-player-close" onClick={onClose}>
          ✕
        </button>
        <iframe
          ref={playerRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${shortId}?autoplay=1`}
          title="YouTube Shorts player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ShortsPlayer;
