
import { getSession, sessionOptions } from '@/lib/session';
import { users } from '@/lib/data';
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  // Omit password from session data
  const { password: _, ...userWithoutPassword } = user;

  const session = await getSession();
  session.user = userWithoutPassword;
  await session.save();

  return NextResponse.json({ ok: true, user: userWithoutPassword });
}

    