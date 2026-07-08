import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 400 });

    const user = await getUserByToken(token);
    if (!user) return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });

    const db = getSupabase();
    const { data } = await db
      .from('user_cooldowns')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({ ok: true, cooldowns: data?.data ?? {} });
  } catch (err) {
    console.error('Cooldowns GET error:', err);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token, cooldowns } = await req.json();
    if (!token) return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 400 });

    const user = await getUserByToken(token);
    if (!user) return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });

    const db = getSupabase();
    await db.from('user_cooldowns').upsert({
      user_id: user.id,
      data: cooldowns ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Cooldowns PUT error:', err);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
