import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;
const PREFIX = 'pkmmo';
const LOCAL_PREFIX = 'pkmmo_';

function getRedis(): Redis | null {
  if (!_redis) {
    const url = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
    const token = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    _redis = new Redis({ url, token });
  }
  return _redis;
}

function localStorageKey(key: string) {
  return `${LOCAL_PREFIX}${key}`;
}

function getLocalStorageValue(key: string): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(localStorageKey(key)) ?? '';
}

function setLocalStorageValue(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(localStorageKey(key), value);
}

function removeLocalStorageValue(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(localStorageKey(key));
}

const k = (key: string) => `${PREFIX}_${key}`;

export async function storageGet(key: string): Promise<string> {
  try {
    const r = getRedis();
    if (!r) return getLocalStorageValue(key);
    const val = await r.get<string>(k(key));
    if (val != null) {
      setLocalStorageValue(key, val);
      return val;
    }
    return getLocalStorageValue(key);
  } catch {
    return getLocalStorageValue(key);
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    const r = getRedis();
    if (r) await r.set(k(key), value);
  } catch {
    console.error(`Redis set failed for key: ${key}`);
  }
  setLocalStorageValue(key, value);
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
    if (r) await r.del(k(key));
  } catch {
    console.error(`Redis del failed for key: ${key}`);
  }
  removeLocalStorageValue(key);
}

export async function storageMGet(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  try {
    const r = getRedis();
    if (!r) {
      keys.forEach(key => { result[key] = getLocalStorageValue(key); });
      return result;
    }
    const redisKeys = keys.map(k);
    const values = await r.mget<string[]>(...redisKeys);
    keys.forEach((key, i) => {
      const val = values[i];
      if (val != null) {
        setLocalStorageValue(key, val);
        result[key] = val;
      } else {
        result[key] = getLocalStorageValue(key);
      }
    });
    return result;
  } catch {
    keys.forEach(key => { result[key] = getLocalStorageValue(key); });
    return result;
  }
}
