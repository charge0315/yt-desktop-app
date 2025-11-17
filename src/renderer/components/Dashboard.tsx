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
  const [activeTab, setActiveTab] = useState('home');
  const [syncing, setSyncing] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const result = await window.electronAPI.forceSync();
      if (result.success) {
        alert('同期が完了しました');
        // Refresh the current view
        window.location.reload();
      } else {
        alert(`同期に失敗しました: ${result.error}`);
      }
    } catch (error) {
      alert('同期エラーが発生しました');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('キャッシュをクリアしますか？')) return;
    
    try {
      const result = await window.electronAPI.clearCache();
      if (result.success) {
        alert('キャッシュをクリアしました');
      } else {
        alert(`キャッシュのクリアに失敗しました: ${result.error}`);
      }
    } catch (error) {
      alert('エラーが発生しました');
      console.error('Clear cache error:', error);
    }
  };

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
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            ホーム
          </div>
          <div
            className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            登録チャンネル
          </div>
          <div
            className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            アーティスト
          </div>
          <div
            className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            再生リスト
          </div>
          <div
            className={`tab ${activeTab === 'music-playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('music-playlists')}
          >
            YouTube Musicプレイリスト
          </div>
          <div
            className={`tab ${activeTab === 'shorts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shorts')}
          >
            ショート
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleForceSync}
            disabled={syncing}
          >
            {syncing ? '同期中...' : '強制同期'}
          </button>
          <button className="btn btn-secondary" onClick={handleClearCache}>
            キャッシュクリア
          </button>
        </div>
      </div>

      {activeTab === 'home' && (
        <>
          <LatestVideos onVideoClick={handleVideoClick} />
          <Shorts onShortClick={handleShortClick} limit={12} />
          <Subscriptions limit={12} />
          <Artists limit={12} />
          <Playlists limit={12} />
          <MusicPlaylists limit={12} />
        </>
      )}
      {activeTab === 'subscriptions' && <Subscriptions />}
      {activeTab === 'artists' && <Artists />}
      {activeTab === 'playlists' && <Playlists />}
      {activeTab === 'music-playlists' && <MusicPlaylists />}
      {activeTab === 'shorts' && <Shorts onShortClick={handleShortClick} />}

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
