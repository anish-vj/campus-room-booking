import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, MAX_AGE_SECONDS, createSessionToken, verifyPin } from '@/lib/admin-session';

export async function POST(request: NextRequest) {
    let body: Record<string, unknown>;
    try {
          body = await request.json();
    } catch {
          return NextResponse.json({ error: 'invalid_pin' }, { status: 401 });
    }

  const pin = body?.pin;
    if (typeof pin !== 'string' || !verifyPin(pin)) {
          return NextResponse.json({ error: 'invalid_pin' }, { status: 401 });
    }

  const token = createSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: MAX_AGE_SECONDS,
    });
    return response;
}
