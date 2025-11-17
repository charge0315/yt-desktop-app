import React, { useState, useEffect } from 'react';

interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  isMusic: boolean;
}

interface MusicPlaylistsProps {
  limit?: number;
}

const MusicPlaylists: React.FC<MusicPlaylistsProps> = ({ limit }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getMusicPlaylists();
      if (result.success) {
        const allPlaylists = result.data || [];
        setPlaylists(limit ? allPlaylists.slice(0, limit) : allPlaylists);
      } else {
        setError(result.error || 'YouTube Musicプレイリストの読み込みに失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to load music playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">YouTube Music プレイリスト</h2>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <h2 className="section-title">YouTube Music プレイリスト</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">YouTube Music プレイリスト</h2>
        <div className="empty-state">
          <h3>音楽プレイリストがありません</h3>
          <p>音楽関連の再生リストがここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">YouTube Music プレイリスト</h2>
        {limit && playlists.length >= limit && (
          <span className="card-subtitle">他 {playlists.length - limit} 件</span>
        )}
      </div>
      <div className="grid grid-3">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="card">
            <img
              src={playlist.thumbnail}
              alt={playlist.title}
              className="card-thumbnail"
            />
            <div className="card-title">{playlist.title}</div>
            <div className="card-subtitle">{playlist.itemCount} 本の動画</div>
            <span className="badge">音楽</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicPlaylists;
