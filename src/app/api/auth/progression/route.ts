import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken, getProgression, saveProgression, updateUserLevelFromProgression, getUserStats, updateUserStats } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 400 });

    const user = await getUserByToken(token);
    if (!user) return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });

    const progression = await getProgression(user.id);
    
    // If progression is empty, backfill it from existing user data to prevent data loss
    if (!progression || Object.keys(progression).length === 0) {
      const stats = await getUserStats(user.id);
      progression.profile = {
        level: user.level || 1,
        totalXP: user.xp || 0,
        currentXP: user.xp || 0,
        coins: user.coins || 0
      };
      progression.statistics = {
        gymsCompleted: stats.totalGyms || 0,
        guidesFinished: stats.totalHoohRuns || 0,
        totalTimeMs: stats.totalTimeMs || 0
      };
      progression.achievements = stats.achievements || [];
    } else {
      // Backfill user level/xp from saved progression data
      if (progression && progression.profile) {
        await updateUserLevelFromProgression(user.id, progression);
      }
    }
    
    return NextResponse.json({ ok: true, progression });
  } catch (err) {
    console.error('Progression GET error:', err);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token, data } = await req.json();
    if (!token) return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 400 });

    const user = await getUserByToken(token);
    if (!user) return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });

    await saveProgression(user.id, data);
    await updateUserLevelFromProgression(user.id, data);

    // Sync auth stats from progression data
    const existingStats = await getUserStats(user.id);
    const progStats = (data as Record<string, unknown>).statistics as Record<string, unknown> | undefined;
    if (progStats) {
      const progProfile = (data as Record<string, unknown>).profile as Record<string, unknown> | undefined;
      await updateUserStats(user.id, {
        totalGyms: (progStats.gymsCompleted as number) ?? existingStats.totalGyms,
        totalHoohRuns: (progStats.guidesFinished as number) ?? existingStats.totalHoohRuns,
        totalTimeMs: (progStats.totalTimeMs as number) ?? existingStats.totalTimeMs,
        streaks: {
          current: (progProfile?.currentStreak as number) ?? existingStats.streaks.current,
          best: (progProfile?.bestStreak as number) ?? existingStats.streaks.best,
        },
        achievements: (progStats.totalAchievements as number) > 0
          ? ((data as Record<string, unknown>).achievements as string[]) ?? existingStats.achievements
          : existingStats.achievements,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Progression PUT error:', err);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
