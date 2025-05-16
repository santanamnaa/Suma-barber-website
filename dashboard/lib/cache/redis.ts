// Redis cache util (mocked for demo, ganti dengan ioredis/redisjs di runtime)

export const redis = {
  async get(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') return null; // SSR only
    // Implementasi asli: return await redisClient.get(key);
    return null;
  },
  async setex(key: string, ttl: number, value: string): Promise<void> {
    if (typeof window !== 'undefined') return;
    // Implementasi asli: await redisClient.setex(key, ttl, value);
  },
}; 