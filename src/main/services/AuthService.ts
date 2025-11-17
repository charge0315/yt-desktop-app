import Store from 'electron-store';
import { google } from 'googleapis';
import * as http from 'http';
import * as url from 'url';
import { shell } from 'electron';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export class AuthService {
  private store: Store;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private oauth2Client: any;
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ];

  constructor() {
    this.store = new Store();

    // These should be configured via environment or config
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
    const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

    // Debug logging (remove in production)
    console.log('=== OAuth Configuration Debug ===');
    console.log('CLIENT_ID loaded:', CLIENT_ID ? `${CLIENT_ID.substring(0, 20)}...${CLIENT_ID.substring(CLIENT_ID.length - 10)}` : 'NOT SET');
    console.log('CLIENT_SECRET loaded:', CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 10)}...` : 'NOT SET');
    console.log('REDIRECT_URI:', REDIRECT_URI);
    console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
    console.log('================================');

    this.oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // Load stored tokens
    const tokens = this.store.get('auth_tokens') as AuthTokens | undefined;
    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
    }
  }

  async authenticate(): Promise<AuthTokens> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      prompt: 'consent'
    });

    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        try {
          if (req.url && req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
            const code = qs.get('code');
            
            res.end('Authentication successful! You can close this window.');
            server.close();

            if (!code) {
              reject(new Error('No authorization code received'));
              return;
            }

            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            this.store.set('auth_tokens', tokens);
            
            resolve(tokens as AuthTokens);
          }
        } catch (error) {
          reject(error);
        }
      }).listen(3000, () => {
        // Open browser for authentication
        shell.openExternal(authUrl);
      });
    });
  }

  async refreshAccessToken(): Promise<void> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      this.store.set('auth_tokens', credentials);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    const tokens = this.store.get('auth_tokens') as AuthTokens | undefined;
    return !!tokens && !!tokens.access_token;
  }

  logout(): void {
    this.store.delete('auth_tokens');
    this.oauth2Client.setCredentials({});
  }

  getOAuth2Client() {
    return this.oauth2Client;
  }

  async ensureValidToken(): Promise<void> {
    const tokens = this.store.get('auth_tokens') as AuthTokens | undefined;
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (tokens.expiry_date && tokens.expiry_date < Date.now() + 5 * 60 * 1000) {
      await this.refreshAccessToken();
    }
  }
}
