// storage.ts — Game state storage
// Uses localStorage as primary store (works on client).
// Server-side Supabase key-value table available as fallback if needed,
// but for anonymous/local game data localStorage is sufficient.

const LOCAL_PREFIX = 'pkmmo_';

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

export async function storageGet(key: string): Promise<string> {
  return getLocalStorageValue(key);
}

export async function storageSet(key: string, value: string): Promise<void> {
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
  removeLocalStorageValue(key);
}

export async function storageMGet(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  keys.forEach(key => {
    result[key] = getLocalStorageValue(key);
  });
  return result;
}
