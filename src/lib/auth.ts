import { getSupabase } from '@/lib/supabase';

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
  resetToken?: string | null;
  resetTokenExpiresAt?: number | null;
}

const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
const XP_PER_LEVEL = 100;

// ─── Password helpers ──────────────────────────────────────────────────────

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
  if (!saltHex || !hashHex) return false;
  const bytes = saltHex.match(/.{2}/g);
  if (!bytes) return false;
  const salt = new Uint8Array(bytes.map(h => parseInt(h, 16)));
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salted = new Uint8Array([...salt, ...data]);

  const hashBuffer = await crypto.subtle.digest('SHA-256', salted);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex2 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === hashHex2;
}

// ─── Public helpers ────────────────────────────────────────────────────────

export function generateToken(): string {
  return crypto.randomUUID();
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

// ─── DB row → domain mappers ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUserWithHash(row: any): UserWithHash {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: row.avatar ?? '',
    createdAt: row.created_at,
    lastLogin: row.last_login,
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    coins: row.coins ?? 0,
    passwordHash: row.password_hash,
    resetToken: row.reset_token ?? null,
    resetTokenExpiresAt: row.reset_token_expires_at ?? null,
  };
}

// ─── Register ─────────────────────────────────────────────────────────────

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

    const db = getSupabase();

    // Check duplicates
    const { data: existingEmail } = await db
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (existingEmail) return { error: 'Este email ya está registrado' };

    const { data: existingUsername } = await db
      .from('users')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();
    if (existingUsername) return { error: 'Este username ya está en uso' };

    const passwordHash = await hashPassword(password);
    const now = Date.now();

    const { data: newUser, error: insertError } = await db
      .from('users')
      .insert({
        username: cleanUsername,
        email: cleanEmail,
        avatar: '',
        password_hash: passwordHash,
        created_at: now,
        last_login: now,
        level: 1,
        xp: 0,
        coins: 0,
      })
      .select()
      .single();

    if (insertError || !newUser) {
      return { error: insertError?.message || 'Error al crear usuario' };
    }

    const userId = newUser.id;

    // Create companion rows
    await db.from('user_stats').insert({
      user_id: userId,
      total_gyms: 0,
      total_hooh_runs: 0,
      total_time_ms: 0,
      streak_current: 0,
      streak_best: 0,
      achievements: [],
    });
    await db.from('user_settings').insert({ user_id: userId, preferences: {}, cooldowns: {} });
    await db.from('user_history').insert({ user_id: userId, gym_history: [], hooh_history: [], run_history: [] });
    await db.from('user_daily').insert({ user_id: userId, tasks_state: null });
    await db.from('user_progression').insert({ user_id: userId, data: {} });
    await db.from('user_cooldowns').insert({ user_id: userId, data: {} });

    // Create session
    const token = generateToken();
    const expiresAt = now + SESSION_TTL * 1000;
    await db.from('sessions').insert({ token, user_id: userId, expires_at: expiresAt });

    const user: User = {
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      avatar: '',
      createdAt: now,
      lastLogin: now,
      level: 1,
      xp: 0,
      coins: 0,
    };

    return { user, token };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('registerUser error:', msg);
    return { error: msg };
  }
}

// ─── Login ────────────────────────────────────────────────────────────────

export async function loginUser(
  identifier: string,
  password: string
): Promise<{ user: User; token: string } | { error: string }> {
  try {
    const trimmed = identifier.trim();
    const cleanEmail = trimmed.toLowerCase();
    const db = getSupabase();

    let query;
    if (cleanEmail.includes('@')) {
      query = db.from('users').select('*').eq('email', cleanEmail).maybeSingle();
    } else {
      query = db.from('users').select('*').ilike('username', trimmed).limit(1).maybeSingle();
    }

    const { data: row, error } = await query;
    if (error || !row) {
      return { error: 'Usuario o contraseña incorrectos' };
    }

    const userData = rowToUserWithHash(row);
    const valid = await verifyPassword(password, userData.passwordHash);
    if (!valid) {
      return { error: 'Usuario o contraseña incorrectos' };
    }

    const now = Date.now();
    await db.from('users').update({ last_login: now }).eq('id', userData.id);

    const token = generateToken();
    const expiresAt = now + SESSION_TTL * 1000;
    await db.from('sessions').insert({ token, user_id: userData.id, expires_at: expiresAt });

    const user: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
      createdAt: userData.createdAt,
      lastLogin: now,
      level: userData.level,
      xp: userData.xp,
      coins: userData.coins,
    };

    return { user, token };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('loginUser error:', msg);
    return { error: msg };
  }
}

// ─── Session ──────────────────────────────────────────────────────────────

export async function getUserByToken(token: string): Promise<User | null> {
  try {
    const db = getSupabase();
    const { data: session } = await db
      .from('sessions')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (!session) return null;
    if (session.expires_at < Date.now()) {
      await db.from('sessions').delete().eq('token', token);
      return null;
    }

    const { data: row } = await db
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .maybeSingle();

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      avatar: row.avatar ?? '',
      createdAt: row.created_at,
      lastLogin: row.last_login,
      level: row.level ?? 1,
      xp: row.xp ?? 0,
      coins: row.coins ?? 0,
    };
  } catch {
    return null;
  }
}

export async function logoutUser(token: string): Promise<void> {
  const db = getSupabase();
  await db.from('sessions').delete().eq('token', token);
}

// ─── Password reset ───────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<UserWithHash | null> {
  try {
    const db = getSupabase();
    const { data: row } = await db
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (!row) return null;
    return rowToUserWithHash(row);
  } catch {
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<{ token?: string; error?: string }> {
  const user = await getUserByEmail(email);
  if (!user) {
    return { error: 'No se encontró una cuenta con ese email.' };
  }

  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 min

  const db = getSupabase();
  await db
    .from('users')
    .update({ reset_token: token, reset_token_expires_at: expiresAt })
    .eq('id', user.id);

  return { token };
}

export async function resetPassword(
  email: string,
  token: string,
  password: string
): Promise<{ error?: string }> {
  const user = await getUserByEmail(email);
  if (!user) return { error: 'No se encontró una cuenta con ese email.' };
  if (!user.resetToken || !user.resetTokenExpiresAt) return { error: 'No se ha solicitado un token de recuperación.' };
  if (user.resetToken !== token) return { error: 'Token de recuperación inválido.' };
  if (Date.now() > user.resetTokenExpiresAt) return { error: 'El token de recuperación expiró.' };
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' };

  const passwordHash = await hashPassword(password);
  const db = getSupabase();
  await db
    .from('users')
    .update({ password_hash: passwordHash, reset_token: null, reset_token_expires_at: null })
    .eq('id', user.id);

  return {};
}

// ─── Stats ────────────────────────────────────────────────────────────────

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const db = getSupabase();
    const { data } = await db.from('user_stats').select('*').eq('user_id', userId).maybeSingle();
    if (!data) return { totalGyms: 0, totalHoohRuns: 0, totalTimeMs: 0, streaks: { current: 0, best: 0 }, achievements: [] };
    return {
      totalGyms: data.total_gyms ?? 0,
      totalHoohRuns: data.total_hooh_runs ?? 0,
      totalTimeMs: data.total_time_ms ?? 0,
      streaks: { current: data.streak_current ?? 0, best: data.streak_best ?? 0 },
      achievements: data.achievements ?? [],
    };
  } catch {
    return { totalGyms: 0, totalHoohRuns: 0, totalTimeMs: 0, streaks: { current: 0, best: 0 }, achievements: [] };
  }
}

export async function updateUserStats(userId: string, stats: UserStats): Promise<void> {
  const db = getSupabase();
  await db.from('user_stats').upsert({
    user_id: userId,
    total_gyms: stats.totalGyms,
    total_hooh_runs: stats.totalHoohRuns,
    total_time_ms: stats.totalTimeMs,
    streak_current: stats.streaks.current,
    streak_best: stats.streaks.best,
    achievements: stats.achievements,
  });
}

// ─── History ──────────────────────────────────────────────────────────────

export async function getUserHistory(userId: string): Promise<UserHistory> {
  try {
    const db = getSupabase();
    const { data } = await db.from('user_history').select('*').eq('user_id', userId).maybeSingle();
    if (!data) return { gymHistory: [], hoohHistory: [], runHistory: [] };
    return {
      gymHistory: data.gym_history ?? [],
      hoohHistory: data.hooh_history ?? [],
      runHistory: data.run_history ?? [],
    };
  } catch {
    return { gymHistory: [], hoohHistory: [], runHistory: [] };
  }
}

export async function updateUserHistory(userId: string, history: UserHistory): Promise<void> {
  const db = getSupabase();
  await db.from('user_history').upsert({
    user_id: userId,
    gym_history: history.gymHistory,
    hooh_history: history.hoohHistory,
    run_history: history.runHistory,
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const db = getSupabase();
    const { data } = await db.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
    if (!data) return { preferences: {}, cooldowns: {} };
    return {
      preferences: data.preferences ?? {},
      cooldowns: data.cooldowns ?? {},
    };
  } catch {
    return { preferences: {}, cooldowns: {} };
  }
}

export async function updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
  const db = getSupabase();
  await db.from('user_settings').upsert({
    user_id: userId,
    preferences: settings.preferences,
    cooldowns: settings.cooldowns,
  });
}

// ─── Daily ────────────────────────────────────────────────────────────────

export async function getUserDaily(userId: string): Promise<UserDaily> {
  try {
    const db = getSupabase();
    const { data } = await db.from('user_daily').select('*').eq('user_id', userId).maybeSingle();
    if (!data) return { tasksState: null };
    return { tasksState: data.tasks_state ?? null };
  } catch {
    return { tasksState: null };
  }
}

export async function updateUserDaily(userId: string, daily: UserDaily): Promise<void> {
  const db = getSupabase();
  await db.from('user_daily').upsert({ user_id: userId, tasks_state: daily.tasksState });
}

// ─── Profile ──────────────────────────────────────────────────────────────

export async function updateUserProfile(
  userId: string,
  updates: { username?: string; avatar?: string }
): Promise<User> {
  const db = getSupabase();
  const updateData: Record<string, unknown> = {};
  if (updates.username) updateData.username = updates.username;
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;

  const { data: row, error } = await db
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || 'User not found');

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: row.avatar ?? '',
    createdAt: row.created_at,
    lastLogin: row.last_login,
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    coins: row.coins ?? 0,
  };
}

// ─── XP / Level ───────────────────────────────────────────────────────────

export async function addXp(userId: string, amount: number): Promise<User> {
  const db = getSupabase();
  const { data: row } = await db.from('users').select('*').eq('id', userId).maybeSingle();
  if (!row) throw new Error('User not found');

  const newXp = (row.xp ?? 0) + amount;
  const newLevel = calculateLevel(newXp);

  const { data: updated, error } = await db
    .from('users')
    .update({ xp: newXp, level: newLevel })
    .eq('id', userId)
    .select()
    .single();

  if (error || !updated) throw new Error(error?.message || 'Update failed');

  return {
    id: updated.id,
    username: updated.username,
    email: updated.email,
    avatar: updated.avatar ?? '',
    createdAt: updated.created_at,
    lastLogin: updated.last_login,
    level: updated.level ?? 1,
    xp: updated.xp ?? 0,
    coins: updated.coins ?? 0,
  };
}

// ─── Progression ──────────────────────────────────────────────────────────

export async function getProgression(userId: string): Promise<Record<string, unknown>> {
  try {
    const db = getSupabase();
    const { data } = await db.from('user_progression').select('data').eq('user_id', userId).maybeSingle();
    return (data?.data as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

export async function saveProgression(userId: string, data: Record<string, unknown>): Promise<void> {
  const db = getSupabase();
  await db.from('user_progression').upsert({ user_id: userId, data });
}

export async function updateUserLevelFromProgression(
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = getSupabase();
  const profile = (data as Record<string, unknown>).profile as Record<string, unknown> | undefined;
  if (profile && typeof profile.level === 'number' && typeof profile.totalXP === 'number') {
    await db.from('users').update({
      level: profile.level,
      xp: profile.totalXP,
      coins: typeof profile.coins === 'number' ? profile.coins : 0,
    }).eq('id', userId);
  }
}

// ─── Local data check ─────────────────────────────────────────────────────

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
