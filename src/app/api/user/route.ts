
import { NextResponse } from 'next/server';

// This endpoint is no longer used as user is hardcoded in the context.
export async function GET() {
  return NextResponse.json({ user: null });
}
