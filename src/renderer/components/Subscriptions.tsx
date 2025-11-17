import React, { useState, useEffect } from 'react';

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isMusic: boolean;
}

interface SubscriptionsProps {
  limit?: number;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ limit }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getSubscriptions();
      if (result.success) {
        const allChannels = result.data || [];
        setChannels(limit ? allChannels.slice(0, limit) : allChannels);
      } else {
        setError(result.error || 'チャンネルの読み込みに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">登録チャンネル</h2>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <h2 className="section-title">登録チャンネル</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">登録チャンネル</h2>
        <div className="empty-state">
          <h3>チャンネルがありません</h3>
          <p>YouTubeで登録したチャンネルがここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">登録チャンネル</h2>
        {limit && channels.length >= limit && (
          <span className="card-subtitle">他 {channels.length - limit} 件</span>
        )}
      </div>
      <div className="grid grid-4">
        {channels.map((channel) => (
          <div key={channel.id} className="card">
            <img
              src={channel.thumbnail}
              alt={channel.title}
              className="channel-avatar"
            />
            <div className="card-title">{channel.title}</div>
            {channel.isMusic && <span className="badge">音楽</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
