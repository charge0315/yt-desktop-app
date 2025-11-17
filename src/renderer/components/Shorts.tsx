import React, { useState, useEffect } from 'react';

interface Short {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  categoryId: string;
}

interface ShortsProps {
  onShortClick?: (shortId: string) => void;
  limit?: number;
}

const Shorts: React.FC<ShortsProps> = ({ onShortClick, limit }) => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShorts();
  }, []);

  const loadShorts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getShorts();
      if (result.success) {
        const data = result.data || [];
        setShorts(limit ? data.slice(0, limit) : data);
      } else {
        setError(result.error || 'ショート動画の読み込みに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to load shorts:', err);
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
        <h2 className="section-title">ショート動画</h2>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <h2 className="section-title">ショート動画</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">ショート動画</h2>
        <div className="empty-state">
          <h3>ショート動画がありません</h3>
          <p>登録チャンネルのショート動画がここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">ショート動画</h2>
      <div className="grid grid-4">
        {shorts.map((short) => (
          <div
            key={short.id}
            className="card shorts-card"
            onClick={() => onShortClick?.(short.id)}
          >
            <div className="shorts-thumbnail-wrapper">
              <img
                src={short.thumbnail}
                alt={short.title}
                className="shorts-thumbnail"
              />
              <div className="shorts-badge">Shorts</div>
            </div>
            <div className="card-title">{short.title}</div>
            <div className="card-subtitle">{short.channelTitle}</div>
            <div className="card-meta">
              <span>{formatDate(short.publishedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shorts;
