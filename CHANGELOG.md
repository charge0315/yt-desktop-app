# Changelog

## [1.0.0] - 2025-11-17

### Added
- Initial release of YouTube Desktop App
- Integrated dashboard with multiple sections:
  - Latest videos from subscribed channels
  - Subscribed channels list
  - Artists (music channels)
  - Playlists
  - YouTube Music playlists
- Google OAuth 2.0 authentication
  - Automatic token refresh
  - Secure token storage
- YouTube Data API v3 integration
  - Fetch subscriptions
  - Fetch latest videos
  - Fetch playlists
  - Automatic music content detection
- MongoDB caching system
  - Configurable TTL (default 30 minutes)
  - Force sync option
  - Cache clear functionality
- Multi-tab interface
  - Home view with all sections
  - Dedicated views for each content type
- Security features
  - Context isolation
  - No node integration in renderer
  - Preload script for safe IPC
- Development tools
  - TypeScript for type safety
  - ESLint for code quality
  - Jest for testing
  - Webpack for bundling
- Documentation
  - Comprehensive README
  - API documentation
  - Environment configuration example

### Technical Details
- Built with Electron 28
- React 18 for UI
- TypeScript 5.3
- MongoDB for caching
- Google APIs for YouTube integration

### Requirements
- Node.js 18+
- MongoDB (local or cloud)
- Google Cloud Platform account with YouTube Data API v3 enabled
