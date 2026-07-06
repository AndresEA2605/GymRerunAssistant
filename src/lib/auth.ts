import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;
function getRedis() {
  if (!_redis) {
    _redis = Redis.fromEnv();
  }
  return _redis;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: number;
  lastLogin: number;
  level: number;
  xp: number;
  coins: number;
}

export interface UserStats {
  totalGyms: number;
  totalHoohRuns: number;
  totalTimeMs: number;
  streaks: { current: number; best: number };
  achievements: string[];
}

export interface UserSettings {
  preferences: Record<string, unknown>;
  cooldowns: Record<string, unknown>;
}

export interface UserHistory {
  gymHistory: unknown[];
  hoohHistory: unknown[];
  runHistory: unknown[];
}

export interface UserDaily {
  tasksState: unknown;
}

export interface SessionData {
  userId: string;
  expiresAt: number;
}

interface UserWithHash extends User {
  passwordHash: string;
}

const SESSION_TTL = 30 * 24 * 60 * 60;
const XP_PER_LEVEL = 100;

function kuser(id: string) { return `auth:user:${id}`; }
function ksession(token: string) { return `auth:session:${token}`; }
function kemail(email: string) { return `auth:email:${email.toLowerCase()}`; }
function kusername(username: string) { return `auth:username:${username.toLowerCase()}`; }

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const salted = new Uint8Array([...salt, ...data]);

  const hashBuffer = await crypto.subtle.digest('SHA-256', salted);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salted = new Uint8Array([...salt, ...data]);

  const hashBuffer = await crypto.subtle.digest('SHA-256', salted);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex2 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === hashHex2;
}

export function generateToken(): string {
  return crypto.randomUUID();
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

export async function registerUser(
  email: string,
  username: string,
  password: string
): Promise<{ user: User; token: string } | { error: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
      return { error: 'Email inválido' };
    }
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return { error: 'El username debe tener entre 3 y 20 caracteres' };
    }
    if (password.length < 6) {
      return { error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const existingEmail = await getRedis().get(kemail(cleanEmail));
    if (existingEmail) {
      return { error: 'Este email ya está registrado' };
    }

    const existingUsername = await getRedis().get(kusername(cleanUsername));
    if (existingUsername) {
      return { error: 'Este username ya está en uso' };
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = Date.now();

    const user: UserWithHash = {
      id,
      username: cleanUsername,
      email: cleanEmail,
      avatar: '',
      createdAt: now,
      lastLogin: now,
      level: 1,
      xp: 0,
      coins: 0,
      passwordHash,
    };

    await getRedis().set(kuser(id), user);
    await getRedis().set(kemail(cleanEmail), id);
    await getRedis().set(kusername(cleanUsername), id);

    const stats: UserStats = {
      totalGyms: 0,
      totalHoohRuns: 0,
      totalTimeMs: 0,
      streaks: { current: 0, best: 0 },
      achievements: [],
    };
    await getRedis().set(`${kuser(id)}:stats`, stats);
    await getRedis().set(`${kuser(id)}:settings`, { preferences: {}, cooldowns: {} });
    await getRedis().set(`${kuser(id)}:history`, { gymHistory: [], hoohHistory: [], runHistory: [] });
    await getRedis().set(`${kuser(id)}:daily`, { tasksState: null });

    const token = generateToken();
    const session: SessionData = { userId: id, expiresAt: now + SESSION_TTL * 1000 };
    await getRedis().set(ksession(token), session, { ex: SESSION_TTL });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('registerUser error:', msg);
    return { error: msg };
  }
}

export async function loginUser(
  identifier: string,
  password: string
): Promise<{ user: User; token: string } | { error: string }> {
  try {
    const clean = identifier.toLowerCase().trim();

    let userId: string | null = null;

    if (clean.includes('@')) {
      userId = await getRedis().get<string>(kemail(clean));
    } else {
      userId = await getRedis().get<string>(kusername(clean));
    }

    if (!userId || typeof userId !== 'string') {
      return { error: 'Usuario o contraseña incorrectos' };
    }

    const userData = await getRedis().get<UserWithHash>(kuser(userId));
    if (!userData || !userData.passwordHash) {
      return { error: 'Usuario no encontrado' };
    }

    const valid = await verifyPassword(password, userData.passwordHash);
    if (!valid) {
      return { error: 'Usuario o contraseña incorrectos' };
    }

    const now = Date.now();
    const updatedUser: UserWithHash = { ...userData, lastLogin: now };
    await getRedis().set(kuser(userId), updatedUser);

    const token = generateToken();
    const session: SessionData = { userId, expiresAt: now + SESSION_TTL * 1000 };
    await getRedis().set(ksession(token), session, { ex: SESSION_TTL });

    const { passwordHash: _, ...safeUser } = updatedUser;
    return { user: safeUser, token };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('loginUser error:', msg);
    return { error: msg };
  }
}

export async function getUserByToken(token: string): Promise<User | null> {
  try {
    const session = await getRedis().get<SessionData>(ksession(token));
    if (!session || !session.userId) return null;

    if (session.expiresAt < Date.now()) {
      await getRedis().del(ksession(token));
      return null;
    }

    const data = await getRedis().get<UserWithHash>(kuser(session.userId));
    if (!data) return null;

    const { passwordHash: _, ...user } = data;
    return user;
  } catch {
    return null;
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const stats = await getRedis().get<UserStats>(`${kuser(userId)}:stats`);
    if (!stats) {
      return { totalGyms: 0, totalHoohRuns: 0, totalTimeMs: 0, streaks: { current: 0, best: 0 }, achievements: [] };
    }
    return stats;
  } catch {
    return { totalGyms: 0, totalHoohRuns: 0, totalTimeMs: 0, streaks: { current: 0, best: 0 }, achievements: [] };
  }
}

export async function updateUserStats(userId: string, stats: UserStats): Promise<void> {
  await getRedis().set(`${kuser(userId)}:stats`, stats);
}

export async function getUserHistory(userId: string): Promise<UserHistory> {
  try {
    const history = await getRedis().get<UserHistory>(`${kuser(userId)}:history`);
    if (!history) {
      return { gymHistory: [], hoohHistory: [], runHistory: [] };
    }
    return history;
  } catch {
    return { gymHistory: [], hoohHistory: [], runHistory: [] };
  }
}

export async function updateUserHistory(userId: string, history: UserHistory): Promise<void> {
  await getRedis().set(`${kuser(userId)}:history`, history);
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const settings = await getRedis().get<UserSettings>(`${kuser(userId)}:settings`);
    if (!settings) {
      return { preferences: {}, cooldowns: {} };
    }
    return settings;
  } catch {
    return { preferences: {}, cooldowns: {} };
  }
}

export async function updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
  await getRedis().set(`${kuser(userId)}:settings`, settings);
}

export async function getUserDaily(userId: string): Promise<UserDaily> {
  try {
    const daily = await getRedis().get<UserDaily>(`${kuser(userId)}:daily`);
    if (!daily) {
      return { tasksState: null };
    }
    return daily;
  } catch {
    return { tasksState: null };
  }
}

export async function updateUserDaily(userId: string, daily: UserDaily): Promise<void> {
  await getRedis().set(`${kuser(userId)}:daily`, daily);
}

export async function logoutUser(token: string): Promise<void> {
  await getRedis().del(ksession(token));
}

export async function addXp(userId: string, amount: number): Promise<User> {
  const data = await getRedis().get<UserWithHash>(kuser(userId));
  if (!data) throw new Error('User not found');

  data.xp += amount;
  data.level = calculateLevel(data.xp);

  await getRedis().set(kuser(userId), data);

  const { passwordHash: _, ...user } = data;
  return user;
}

export async function hasLocalData(localData: Record<string, string>): Promise<boolean> {
  return !!(
    localData['gym_step'] && localData['gym_step'] !== '0' && localData['gym_step'] !== '-1' ||
    localData['gym_timer'] && localData['gym_timer'] !== '{"elapsed":0,"isRunning":false,"startedAt":null}' ||
    localData['gym_history'] && localData['gym_history'] !== '[]' ||
    localData['run_active_gym33'] === 'true' ||
    localData['run_active_hooh'] === 'true' ||
    localData['run_active_guide2'] === 'true'
  );
}

export async function updateUserProfile(userId: string, updates: { username?: string; avatar?: string }): Promise<User> {
  const data = await getRedis().get<UserWithHash>(kuser(userId));
  if (!data) throw new Error('User not found');

  if (updates.username) data.username = updates.username;
  if (updates.avatar !== undefined) data.avatar = updates.avatar;
  await getRedis().set(kuser(userId), data);

  const { passwordHash: _, ...user } = data;
  return user;
}
