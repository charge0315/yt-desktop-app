import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

declare global {
  interface Window {
    electronAPI: {
      login: () => Promise<{ success: boolean; tokens?: any; error?: string }>;
      getAuthStatus: () => Promise<boolean>;
      logout: () => Promise<{ success: boolean }>;
      getSubscriptions: () => Promise<{ success: boolean; data?: any; error?: string }>;
      getLatestVideos: () => Promise<{ success: boolean; data?: any; error?: string }>;
      getPlaylists: () => Promise<{ success: boolean; data?: any; error?: string }>;
      getArtists: () => Promise<{ success: boolean; data?: any; error?: string }>;
      getMusicPlaylists: () => Promise<{ success: boolean; data?: any; error?: string }>;
      forceSync: () => Promise<{ success: boolean; error?: string }>;
      clearCache: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await window.electronAPI.getAuthStatus();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.login();
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        alert(`ログインに失敗しました: ${result.error}`);
      }
    } catch (error) {
      alert('ログインエラーが発生しました');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await window.electronAPI.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="header">
          <h1>YouTube Desktop App</h1>
        </header>
        <div className="login-container">
          <h2>YouTube Desktop Appへようこそ</h2>
          <p>
            YouTubeとYouTube Musicを統合管理するデスクトップアプリケーションです。
            <br />
            始めるにはGoogleアカウントでログインしてください。
          </p>
          <button className="btn btn-primary" onClick={handleLogin}>
            Googleでログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>YouTube Desktop App</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>
      <Dashboard />
    </div>
  );
};

export default App;
