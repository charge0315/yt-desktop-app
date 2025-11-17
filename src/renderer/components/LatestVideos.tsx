import React, { useState, useEffect } from 'react';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  categoryId: string;
}

const LatestVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getLatestVideos();
      if (result.success) {
        setVideos(result.data || []);
      } else {
        setError(result.error || '動画の読み込みに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 24) {
      return `${hours}時間前`;
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">最新情報</h2>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <h2 className="section-title">最新情報</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">最新情報</h2>
        <div className="empty-state">
          <h3>動画がありません</h3>
          <p>登録チャンネルの最新動画がここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">最新情報</h2>
      <div className="grid grid-3">
        {videos.map((video) => (
          <div key={video.id} className="card">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="card-thumbnail"
            />
            <div className="card-title">{video.title}</div>
            <div className="card-subtitle">{video.channelTitle}</div>
            <div className="card-meta">
              <span>{formatDate(video.publishedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestVideos;
