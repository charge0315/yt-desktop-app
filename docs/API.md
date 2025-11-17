# API Documentation

## Architecture Overview

このアプリケーションは3層構造で構成されています：

1. **Main Process (Electron)**: IPC通信でRenderer Processと通信
2. **Services Layer**: ビジネスロジックとAPIクライアント
3. **Renderer Process (React)**: ユーザーインターフェース

## Services

### AuthService

Google OAuth 2.0認証を管理します。

**主要メソッド:**

- `authenticate()`: OAuth認証フローを開始し、アクセストークンを取得
- `refreshAccessToken()`: アクセストークンを更新
- `isAuthenticated()`: 認証状態を確認
- `logout()`: ログアウト処理
- `ensureValidToken()`: トークンの有効性を確認し、必要に応じて更新

**設定:**

環境変数 `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が必要です。

### CacheService

MongoDBを使用したデータキャッシュシステムです。

**主要メソッド:**

- `connect()`: MongoDBに接続
- `get(collection, key)`: キャッシュデータを取得
- `set(collection, key, data, ttl)`: データをキャッシュに保存（TTL付き）
- `delete(collection, key)`: 特定のキャッシュを削除
- `clearCollection(collection)`: コレクション全体をクリア
- `clearAll()`: 全キャッシュをクリア
- `getAll(collection)`: コレクション内の全データを取得

**設定:**

環境変数 `MONGODB_URI` でMongoDB接続文字列を指定（デフォルト: `mongodb://localhost:27017`）

### YouTubeService

YouTube Data API v3との統合を提供します。

**主要メソッド:**

- `getSubscriptions()`: 登録チャンネルを取得
- `getLatestVideos(limit)`: 最新動画を取得
- `getPlaylists()`: 再生リストを取得
- `getArtists()`: 音楽関連チャンネルを取得
- `getMusicPlaylists()`: 音楽関連再生リストを取得
- `forceSyncAll()`: 全データを強制的に同期

**キャッシュ戦略:**

- デフォルトTTL: 30分
- 2回目以降の読み込みはキャッシュから高速取得
- `forceSyncAll()` でキャッシュをリセット可能

**音楽判定:**

チャンネルやプレイリストが音楽関連かどうかを自動判定：
- サンプル動画（最大10本）のカテゴリを確認
- 50%以上が音楽カテゴリ（ID: 10）なら音楽関連と判定

## IPC API

Renderer ProcessからMain Processへの通信に使用するAPIです。

### 認証

- `electronAPI.login()`: ログイン
- `electronAPI.getAuthStatus()`: 認証状態を取得
- `electronAPI.logout()`: ログアウト

### YouTube データ

- `electronAPI.getSubscriptions()`: 登録チャンネルを取得
- `electronAPI.getLatestVideos()`: 最新動画を取得
- `electronAPI.getPlaylists()`: 再生リストを取得
- `electronAPI.getArtists()`: アーティスト（音楽チャンネル）を取得
- `electronAPI.getMusicPlaylists()`: 音楽再生リストを取得

### キャッシュ管理

- `electronAPI.forceSync()`: 全データを強制同期
- `electronAPI.clearCache()`: キャッシュをクリア

## データモデル

### Channel

```typescript
interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isMusic: boolean;
}
```

### Video

```typescript
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
```

### Playlist

```typescript
interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  isMusic: boolean;
}
```

## YouTube Data API クォータ管理

YouTube Data API v3には1日あたりのクォータ制限があります。このアプリケーションは以下の方法でクォータを節約します：

1. **キャッシュシステム**: 取得したデータをMongoDBにキャッシュ
2. **TTL（Time To Live）**: 30分間はキャッシュを使用
3. **選択的取得**: 最新動画は上位20チャンネルのみから取得

### APIコスト参考

- `subscriptions.list`: 1コール = 1ユニット
- `search.list`: 1コール = 100ユニット
- `videos.list`: 1コール = 1ユニット
- `playlists.list`: 1コール = 1ユニット
- `playlistItems.list`: 1コール = 1ユニット

## セキュリティ

- **Context Isolation**: 有効化されており、Renderer Processは直接Node.js APIにアクセス不可
- **Node Integration**: 無効化
- **Preload Script**: 安全なAPIのみをRenderer Processに公開
- **OAuth 2.0**: Googleの公式認証フローを使用
- **Token Storage**: electron-storeで安全に保存（暗号化）

## エラーハンドリング

すべてのサービスメソッドは以下の形式でエラーを返します：

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
}
```

UI層でエラーを適切に表示し、ユーザーに通知します。
