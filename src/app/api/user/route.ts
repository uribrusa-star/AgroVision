
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  const user = session.user;

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

    