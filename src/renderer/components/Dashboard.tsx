import React, { useState } from 'react';
import LatestVideos from './LatestVideos';
import Subscriptions from './Subscriptions';
import Artists from './Artists';
import Playlists from './Playlists';
import MusicPlaylists from './MusicPlaylists';
import Shorts from './Shorts';
import VideoPlayer from './VideoPlayer';
import ShortsPlayer from './ShortsPlayer';

const Dashboard: React.FC = () => {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleClosePlayer = () => {
    setSelectedVideoId(null);
  };

  const handleShortClick = (shortId: string) => {
    setSelectedShortId(shortId);
  };

  const handleCloseShortsPlayer = () => {
    setSelectedShortId(null);
  };

  return (
    <div className="container">
      <LatestVideos onVideoClick={handleVideoClick} />
      <Shorts onShortClick={handleShortClick} />
      <Subscriptions />
      <Artists />
      <Playlists />
      <MusicPlaylists />

      {selectedVideoId && (
        <VideoPlayer videoId={selectedVideoId} onClose={handleClosePlayer} />
      )}
      {selectedShortId && (
        <ShortsPlayer shortId={selectedShortId} onClose={handleCloseShortsPlayer} />
      )}
    </div>
  );
};

export default Dashboard;
