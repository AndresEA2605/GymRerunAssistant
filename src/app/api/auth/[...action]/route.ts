import { NextRequest, NextResponse } from 'next/server';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserByToken,
  getUserStats,
  updateUserStats,
  getUserHistory,
  updateUserHistory,
  getUserSettings,
  updateUserSettings,
  getUserDaily,
  updateUserDaily,
  addXp,
  hasLocalData,
  type User,
  type UserStats,
  type UserHistory,
  type UserSettings,
  type UserDaily,
} from '@/lib/auth';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function parseBody(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const { action: actionParts } = await params;
  const action = actionParts[0];

  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await parseBody(req);

  switch (action) {
    case 'register': {
      const { email, username, password } = body;
      if (!email || !username || !password) {
        return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
      }
      const result = await registerUser(email, username, password);
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    case 'login': {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
      }
      const result = await loginUser(email, password);
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    case 'logout': {
      const { token } = body;
      if (!token) {
        return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
      }
      await logoutUser(token);
      return NextResponse.json({ ok: true });
    }

    case 'session': {
      const { token } = body;
      if (!token) {
        return NextResponse.json({ user: null });
      }
      const user = await getUserByToken(token);
      if (!user) {
        return NextResponse.json({ user: null });
      }
      const stats = await getUserStats(user.id);
      return NextResponse.json({ user, stats });
    }

    case 'sync': {
      const { token, localData, mode } = body;
      if (!token) {
        return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
      }
      const user = await getUserByToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
      }

      const cloudStats = await getUserStats(user.id);
      const cloudHistory = await getUserHistory(user.id);
      const cloudSettings = await getUserSettings(user.id);
      const cloudDaily = await getUserDaily(user.id);

      const localHistory = localData?.gym_history ? JSON.parse(localData.gym_history) : [];
      const localStep = localData?.gym_step ? parseInt(localData.gym_step) : 0;
      const localTimer = localData?.gym_timer ? JSON.parse(localData.gym_timer) : null;
      const localCooldown = localData?.gym_cooldown ? JSON.parse(localData.gym_cooldown) : null;
      const localAllCooldowns = localData?.all_cooldowns ? JSON.parse(localData.all_cooldowns) : null;
      const localDaily = localData?.daily_tasks ? JSON.parse(localData.daily_tasks) : null;

      if (mode === 'merge') {
        const mergedStats: UserStats = {
          ...cloudStats,
          totalGyms: Math.max(cloudStats.totalGyms, (cloudStats.totalGyms || 0) + Math.max(0, localStep)),
          totalTimeMs: cloudStats.totalTimeMs + (localTimer?.elapsed || 0),
        };
        const mergedHistory: UserHistory = {
          gymHistory: [...(cloudHistory.gymHistory || []), ...(localHistory || [])].slice(0, 50),
          hoohHistory: [...(cloudHistory.hoohHistory || [])],
          runHistory: [...(cloudHistory.runHistory || [])],
        };
        const mergedSettings: UserSettings = {
          ...cloudSettings,
          cooldowns: { ...cloudSettings.cooldowns, ...(localCooldown ? { gym: localCooldown } : {}), ...(localAllCooldowns || {}) },
        };
        const mergedDaily: UserDaily = localDaily ? { tasksState: localDaily } : cloudDaily;

        await updateUserStats(user.id, mergedStats);
        await updateUserHistory(user.id, mergedHistory);
        await updateUserSettings(user.id, mergedSettings);
        await updateUserDaily(user.id, mergedDaily);
      } else if (mode === 'overwrite_cloud') {
        const newStats: UserStats = {
          ...cloudStats,
          totalGyms: Math.max(0, localStep),
          totalTimeMs: localTimer?.elapsed || 0,
        };
        const newHistory: UserHistory = {
          gymHistory: localHistory || [],
          hoohHistory: cloudHistory.hoohHistory || [],
          runHistory: cloudHistory.runHistory || [],
        };
        const newSettings: UserSettings = {
          ...cloudSettings,
          cooldowns: { ...(localCooldown ? { gym: localCooldown } : {}), ...(localAllCooldowns || {}) },
        };

        await updateUserStats(user.id, newStats);
        await updateUserHistory(user.id, newHistory);
        await updateUserSettings(user.id, newSettings);
        if (localDaily) await updateUserDaily(user.id, { tasksState: localDaily });
      }

      const updatedStats = await getUserStats(user.id);
      const updatedHistory = await getUserHistory(user.id);
      const updatedSettings = await getUserSettings(user.id);
      const updatedDaily = await getUserDaily(user.id);

      const redisKeys: Record<string, string> = {};
      if (updatedHistory.gymHistory?.length) redisKeys['gym_history'] = JSON.stringify(updatedHistory.gymHistory);
      if (updatedStats.totalGyms) redisKeys['gym_step'] = String(updatedStats.totalGyms);
      if (updatedSettings.cooldowns) {
        if ((updatedSettings.cooldowns as Record<string, unknown>).gym) redisKeys['gym_cooldown'] = JSON.stringify((updatedSettings.cooldowns as Record<string, unknown>).gym);
        redisKeys['all_cooldowns'] = JSON.stringify(updatedSettings.cooldowns);
      }
      if (updatedDaily.tasksState) redisKeys['daily_tasks'] = JSON.stringify(updatedDaily.tasksState);

      return NextResponse.json({ ok: true, stats: updatedStats, cloudData: redisKeys });
    }

    case 'profile': {
      const { token, updates } = body;
      if (!token) {
        return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
      }
      const user = await getUserByToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
      }

      const raw = await redis.get<string>(`auth:user:${user.id}`);
      if (!raw) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      const userData = JSON.parse(raw);
      if (updates.username) userData.username = updates.username;
      if (updates.avatar) userData.avatar = updates.avatar;
      await redis.set(`auth:user:${user.id}`, JSON.stringify(userData));

      const { passwordHash: _, ...updatedUser } = userData;
      return NextResponse.json({ user: updatedUser });
    }

    case 'xp': {
      const { token, amount } = body;
      if (!token || !amount) {
        return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 });
      }
      const user = await getUserByToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
      }
      const updated = await addXp(user.id, amount);
      return NextResponse.json({ user: updated });
    }

    default:
      return NextResponse.json({ error: 'Acción desconocida' }, { status: 404 });
  }
}

export { handler as POST };
