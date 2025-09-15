
import { NextResponse } from 'next/server';

// This endpoint is no longer used.
export async function POST(request: Request) {
  return NextResponse.json({ error: 'Login functionality has been removed.' }, { status: 404 });
}
