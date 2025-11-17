import { MongoClient, Db, Collection } from 'mongodb';

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export class CacheService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly CONNECTION_STRING = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  private readonly DB_NAME = 'yt_desktop_cache';

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.CONNECTION_STRING);
      await this.client.connect();
      this.db = this.client.db(this.DB_NAME);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      // Continue without cache
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  private getCollection(name: string): Collection<CacheEntry> | null {
    if (!this.db) return null;
    return this.db.collection<CacheEntry>(name);
  }

  async get(collection: string, key: string): Promise<any | null> {
    const coll = this.getCollection(collection);
    if (!coll) return null;

    try {
      const entry = await coll.findOne({ key });
      if (!entry) return null;

      // Check if expired
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await coll.deleteOne({ key });
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(collection: string, key: string, data: any, ttlMinutes?: number): Promise<void> {
    const coll = this.getCollection(collection);
    if (!coll) return;

    try {
      const entry: CacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: ttlMinutes ? Date.now() + ttlMinutes * 60 * 1000 : undefined
      };

      await coll.updateOne(
        { key },
        { $set: entry },
        { upsert: true }
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(collection: string, key: string): Promise<void> {
    const coll = this.getCollection(collection);
    if (!coll) return;

    try {
      await coll.deleteOne({ key });
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clearCollection(collection: string): Promise<void> {
    const coll = this.getCollection(collection);
    if (!coll) return;

    try {
      await coll.deleteMany({});
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async clearAll(): Promise<void> {
    if (!this.db) return;

    try {
      const collections = await this.db.listCollections().toArray();
      for (const collection of collections) {
        await this.clearCollection(collection.name);
      }
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  async getAll(collection: string): Promise<any[]> {
    const coll = this.getCollection(collection);
    if (!coll) return [];

    try {
      const entries = await coll.find({}).toArray();
      return entries
        .filter(entry => !entry.expiresAt || entry.expiresAt > Date.now())
        .map(entry => entry.data);
    } catch (error) {
      console.error('Cache getAll error:', error);
      return [];
    }
  }

  isConnected(): boolean {
    return this.db !== null;
  }
}
