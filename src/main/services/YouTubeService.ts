import { google, youtube_v3 } from 'googleapis';
import { AuthService } from './AuthService';
import { CacheService } from './CacheService';

export interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isMusic: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  categoryId: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  isMusic: boolean;
}

export class YouTubeService {
  private youtube: youtube_v3.Youtube;
  private authService: AuthService;
  private cacheService: CacheService;
  private readonly CACHE_TTL_MINUTES = 30;
  private readonly MUSIC_CATEGORY_ID = '10'; // Music category

  constructor(authService: AuthService, cacheService: CacheService) {
    this.authService = authService;
    this.cacheService = cacheService;
    this.youtube = google.youtube({
      version: 'v3',
      auth: authService.getOAuth2Client()
    });
  }

  async getSubscriptions(): Promise<Channel[]> {
    // Try cache first
    const cached = await this.cacheService.get('channels', 'subscriptions');
    if (cached) {
      return cached;
    }

    await this.authService.ensureValidToken();

    const subscriptions: Channel[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await this.youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });

      if (response.data.items) {
        for (const item of response.data.items) {
          const channel: Channel = {
            id: item.snippet?.resourceId?.channelId || '',
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            thumbnail: item.snippet?.thumbnails?.default?.url || '',
            isMusic: false // Will be determined later
          };
          subscriptions.push(channel);
        }
      }

      nextPageToken = response.data.nextPageToken || undefined;
    } while (nextPageToken);

    // Determine if channels are music-related
    await this.classifyChannels(subscriptions);

    // Cache the results
    await this.cacheService.set('channels', 'subscriptions', subscriptions, this.CACHE_TTL_MINUTES);

    return subscriptions;
  }

  async getLatestVideos(limit: number = 50): Promise<Video[]> {
    const cached = await this.cacheService.get('videos', 'latest');
    if (cached) {
      return cached;
    }

    await this.authService.ensureValidToken();

    const videos: Video[] = [];
    const subscriptions = await this.getSubscriptions();

    // Get recent uploads from each channel
    for (const channel of subscriptions.slice(0, 20)) { // Limit to reduce API quota
      try {
        const response = await this.youtube.search.list({
          part: ['snippet'],
          channelId: channel.id,
          order: 'date',
          maxResults: 5,
          type: ['video']
        });

        if (response.data.items) {
          for (const item of response.data.items) {
            const video: Video = {
              id: item.id?.videoId || '',
              title: item.snippet?.title || '',
              description: item.snippet?.description || '',
              thumbnail: item.snippet?.thumbnails?.medium?.url || '',
              channelId: item.snippet?.channelId || '',
              channelTitle: item.snippet?.channelTitle || '',
              publishedAt: item.snippet?.publishedAt || '',
              categoryId: ''
            };
            videos.push(video);
          }
        }
      } catch (error) {
        console.error(`Failed to get videos for channel ${channel.id}:`, error);
      }
    }

    // Sort by date
    videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    const latestVideos = videos.slice(0, limit);

    // Get category information for videos
    await this.enrichVideosWithCategories(latestVideos);

    await this.cacheService.set('videos', 'latest', latestVideos, this.CACHE_TTL_MINUTES);

    return latestVideos;
  }

  async getPlaylists(): Promise<Playlist[]> {
    const cached = await this.cacheService.get('playlists', 'all');
    if (cached) {
      return cached;
    }

    await this.authService.ensureValidToken();

    const playlists: Playlist[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await this.youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });

      if (response.data.items) {
        for (const item of response.data.items) {
          const playlist: Playlist = {
            id: item.id || '',
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            thumbnail: item.snippet?.thumbnails?.default?.url || '',
            itemCount: item.contentDetails?.itemCount || 0,
            isMusic: false
          };
          playlists.push(playlist);
        }
      }

      nextPageToken = response.data.nextPageToken || undefined;
    } while (nextPageToken);

    // Classify playlists as music or not
    await this.classifyPlaylists(playlists);

    await this.cacheService.set('playlists', 'all', playlists, this.CACHE_TTL_MINUTES);

    return playlists;
  }

  async getArtists(): Promise<Channel[]> {
    const subscriptions = await this.getSubscriptions();
    return subscriptions.filter(channel => channel.isMusic);
  }

  async getMusicPlaylists(): Promise<Playlist[]> {
    const playlists = await this.getPlaylists();
    return playlists.filter(playlist => playlist.isMusic);
  }

  private async classifyChannels(channels: Channel[]): Promise<void> {
    // Sample videos from each channel to determine if it's music-related
    for (const channel of channels) {
      try {
        const response = await this.youtube.search.list({
          part: ['snippet'],
          channelId: channel.id,
          maxResults: 10,
          type: ['video']
        });

        if (response.data.items && response.data.items.length > 0) {
          const videoIds = response.data.items
            .map(item => item.id?.videoId)
            .filter(id => id) as string[];

          if (videoIds.length > 0) {
            const videoDetails = await this.youtube.videos.list({
              part: ['snippet'],
              id: videoIds
            });

            const musicCount = videoDetails.data.items?.filter(
              video => video.snippet?.categoryId === this.MUSIC_CATEGORY_ID
            ).length || 0;

            // If more than 50% of videos are music, classify as music channel
            channel.isMusic = musicCount > videoIds.length * 0.5;
          }
        }
      } catch (error) {
        console.error(`Failed to classify channel ${channel.id}:`, error);
      }
    }
  }

  private async classifyPlaylists(playlists: Playlist[]): Promise<void> {
    for (const playlist of playlists) {
      try {
        // Get playlist items
        const response = await this.youtube.playlistItems.list({
          part: ['snippet'],
          playlistId: playlist.id,
          maxResults: 10
        });

        if (response.data.items && response.data.items.length > 0) {
          const videoIds = response.data.items
            .map(item => item.snippet?.resourceId?.videoId)
            .filter(id => id) as string[];

          if (videoIds.length > 0) {
            const videoDetails = await this.youtube.videos.list({
              part: ['snippet'],
              id: videoIds
            });

            const musicCount = videoDetails.data.items?.filter(
              video => video.snippet?.categoryId === this.MUSIC_CATEGORY_ID
            ).length || 0;

            // If more than 50% of videos are music, classify as music playlist
            playlist.isMusic = musicCount > videoIds.length * 0.5;
          }
        }
      } catch (error) {
        console.error(`Failed to classify playlist ${playlist.id}:`, error);
      }
    }
  }

  private async enrichVideosWithCategories(videos: Video[]): Promise<void> {
    if (videos.length === 0) return;

    try {
      const videoIds = videos.map(v => v.id).filter(id => id);
      const response = await this.youtube.videos.list({
        part: ['snippet'],
        id: videoIds
      });

      if (response.data.items) {
        const categoryMap = new Map(
          response.data.items.map(item => [
            item.id || '',
            item.snippet?.categoryId || ''
          ])
        );

        videos.forEach(video => {
          video.categoryId = categoryMap.get(video.id) || '';
        });
      }
    } catch (error) {
      console.error('Failed to enrich videos with categories:', error);
    }
  }

  async forceSyncAll(): Promise<void> {
    // Clear all caches
    await this.cacheService.clearAll();
    
    // Fetch fresh data
    await this.getSubscriptions();
    await this.getLatestVideos();
    await this.getPlaylists();
  }
}
