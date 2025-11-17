import { CacheService } from '../CacheService';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeAll(async () => {
    cacheService = new CacheService();
    // Don't connect to real MongoDB in tests
  });

  afterAll(async () => {
    await cacheService.disconnect();
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      expect(cacheService.isConnected()).toBe(false);
    });
  });

  describe('get', () => {
    it('should return null when not connected', async () => {
      const result = await cacheService.get('test', 'key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should not throw when not connected', async () => {
      await expect(cacheService.set('test', 'key', { data: 'test' })).resolves.not.toThrow();
    });
  });

  describe('clearAll', () => {
    it('should not throw when not connected', async () => {
      await expect(cacheService.clearAll()).resolves.not.toThrow();
    });
  });
});
