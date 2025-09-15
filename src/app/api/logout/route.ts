
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}

    