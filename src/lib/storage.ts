import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!_redis) {
    const url = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
    const token = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    _redis = new Redis({ url, token });
  }
  return _redis;
}

const PREFIX = 'pkmmo';
const k = (key: string) => `${PREFIX}_${key}`;

export async function storageGet(key: string): Promise<string> {
  try {
    const r = getRedis();
    if (!r) return '';
    const val = await r.get<string>(k(key));
    return val ?? '';
  } catch {
    return '';
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    await r.set(k(key), value);
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
    const r = getRedis();
    if (!r) return;
    await r.del(k(key));
  } catch {
    console.error(`Redis del failed for key: ${key}`);
  }
}

export async function storageMGet(keys: string[]): Promise<Record<string, string>> {
  try {
    const r = getRedis();
    if (!r) {
      const result: Record<string, string> = {};
      keys.forEach(key => { result[key] = ''; });
      return result;
    }
    const redisKeys = keys.map(k);
    const values = await r.mget<string[]>(...redisKeys);
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
