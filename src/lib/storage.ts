import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const PREFIX = 'pkmmo';
const k = (key: string) => `${PREFIX}_${key}`;

export async function storageGet(key: string): Promise<string> {
  try {
    const val = await redis.get<string>(k(key));
    return val ?? '';
  } catch {
    return '';
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    await redis.set(k(key), value);
  } catch {
    console.error(`Redis set failed for key: ${key}`);
  }
}

export async function storageParse<T>(key: string): Promise<T | null> {
  const raw = await storageGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storageSetJSON(key: string, value: unknown): Promise<void> {
  await storageSet(key, JSON.stringify(value));
}

export async function storageRemove(key: string): Promise<void> {
  try {
    await redis.del(k(key));
  } catch {
    console.error(`Redis del failed for key: ${key}`);
  }
}

export async function storageMGet(keys: string[]): Promise<Record<string, string>> {
  try {
    const redisKeys = keys.map(k);
    const values = await redis.mget<string[]>(...redisKeys);
    const result: Record<string, string> = {};
    keys.forEach((key, i) => {
      result[key] = values[i] ?? '';
    });
    return result;
  } catch {
    const result: Record<string, string> = {};
    keys.forEach(key => { result[key] = ''; });
    return result;
  }
}
