import React, { useState, useEffect } from 'react';

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isMusic: boolean;
}

interface ArtistsProps {
  limit?: number;
}

const Artists: React.FC<ArtistsProps> = ({ limit }) => {
  const [artists, setArtists] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getArtists();
      if (result.success) {
        const allArtists = result.data || [];
        setArtists(limit ? allArtists.slice(0, limit) : allArtists);
      } else {
        setError(result.error || 'アーティストの読み込みに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to load artists:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">アーティスト</h2>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <h2 className="section-title">アーティスト</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">アーティスト</h2>
        <div className="empty-state">
          <h3>アーティストがありません</h3>
          <p>音楽関連のチャンネルがここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">アーティスト</h2>
        {limit && artists.length >= limit && (
          <span className="card-subtitle">他 {artists.length - limit} 件</span>
        )}
      </div>
      <div className="grid grid-4">
        {artists.map((artist) => (
          <div key={artist.id} className="card">
            <img
              src={artist.thumbnail}
              alt={artist.title}
              className="channel-avatar"
            />
            <div className="card-title">{artist.title}</div>
            <span className="badge">音楽</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Artists;
