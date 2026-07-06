import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken, getProgression, saveProgression } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 400 });

    const user = await getUserByToken(token);
    if (!user) return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });

    const progression = await getProgression(user.id);
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
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Progression PUT error:', err);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
