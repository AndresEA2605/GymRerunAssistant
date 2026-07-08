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
} from '@/lib/auth';

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
  try {
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
        const { email, identifier, password } = body;
        const loginId = identifier || email;
        if (!loginId || !password) {
          return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
        }
        const result = await loginUser(loginId, password);
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
        // Fetch stats in parallel with user lookup result
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
        const localStep = localData?.gym_step ? Math.max(0, Number(localData.gym_step) || 0) : 0;
        const localTimer = localData?.gym_timer ? JSON.parse(localData.gym_timer) : null;
        const localCooldown = localData?.gym_cooldown ? JSON.parse(localData.gym_cooldown) : null;
        const localAllCooldowns = localData?.all_cooldowns ? JSON.parse(localData.all_cooldowns) : null;
        const localDaily = localData?.daily_tasks ? JSON.parse(localData.daily_tasks) : null;

        if (mode === 'merge') {
          const mergedStats = {
            ...cloudStats,
            totalGyms: Math.max(cloudStats.totalGyms, (cloudStats.totalGyms || 0) + Math.max(0, localStep)),
            totalTimeMs: cloudStats.totalTimeMs + (localTimer?.elapsed || 0),
          };
          const mergedHistory = {
            gymHistory: [...(cloudHistory.gymHistory || []), ...(localHistory || [])].slice(0, 50),
            hoohHistory: [...(cloudHistory.hoohHistory || [])],
            runHistory: [...(cloudHistory.runHistory || [])],
          };
          const mergedSettings = {
            ...cloudSettings,
            cooldowns: { ...cloudSettings.cooldowns, ...(localCooldown ? { gym: localCooldown } : {}), ...(localAllCooldowns || {}) },
          };
          const mergedDaily = localDaily ? { tasksState: localDaily } : cloudDaily;

          await updateUserStats(user.id, mergedStats);
          await updateUserHistory(user.id, mergedHistory);
          await updateUserSettings(user.id, mergedSettings);
          await updateUserDaily(user.id, mergedDaily);
        } else if (mode === 'overwrite_cloud') {
          const newStats = {
            ...cloudStats,
            totalGyms: Math.max(0, localStep),
            totalTimeMs: localTimer?.elapsed || 0,
          };
          const newHistory = {
            gymHistory: localHistory || [],
            hoohHistory: cloudHistory.hoohHistory || [],
            runHistory: cloudHistory.runHistory || [],
          };
          const newSettings = {
            ...cloudSettings,
            cooldowns: { ...(localCooldown ? { gym: localCooldown } : {}), ...(localAllCooldowns || {}) },
          };

          await updateUserStats(user.id, newStats);
          await updateUserHistory(user.id, newHistory);
          await updateUserSettings(user.id, newSettings);
          if (localDaily) await updateUserDaily(user.id, { tasksState: localDaily });
        }

        const updatedStats = await getUserStats(user.id);
        return NextResponse.json({ ok: true, stats: updatedStats });
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
        const result = await import('@/lib/auth').then(m => m.updateUserProfile(user.id, updates));
        return NextResponse.json({ user: result });
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

      case 'request-reset': {
        const { email } = body;
        if (!email) {
          return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
        }
        const result = await import('@/lib/auth').then(m => m.requestPasswordReset(email));
        if (!result.ok) {
          return NextResponse.json({ error: result.error || 'No se pudo procesar la solicitud.' }, { status: 400 });
        }

        const token = result.token;
        if (token) {
          const emailResult = await import('@/lib/email').then(m => m.sendPasswordResetEmail(email, token));
          if (!emailResult.ok) {
            return NextResponse.json({ error: emailResult.error || 'No se pudo enviar el correo de recuperación.' }, { status: 400 });
          }
        }

        return NextResponse.json({ ok: true, message: 'Si el correo existe, recibirás un enlace de recuperación.' });
      }

      case 'reset-password': {
        const { email, token, password } = body;
        if (!email || !token || !password) {
          return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 });
        }
        const result = await import('@/lib/auth').then(m => m.resetPassword(email, token, password));
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Acción desconocida' }, { status: 404 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    console.error('Auth API error:', msg, stack);
    return NextResponse.json({ error: 'Error interno del servidor', detail: msg }, { status: 500 });
  }
}

export { handler as POST };
