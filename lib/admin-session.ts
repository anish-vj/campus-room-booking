import crypto from 'crypto';

export const COOKIE_NAME = 'admin_session';
export const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
    return secret;
}

function sign(value: string): string {
    return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionToken(): string {
    const payload = `admin:${Date.now()}`;
    const sig = sign(payload);
    return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function verifySessionToken(token: string | undefined | null): boolean {
    if (!token) return false;
    try {
          const decoded = Buffer.from(token, 'base64url').toString('utf8');
          const separatorIndex = decoded.lastIndexOf('.');
          if (separatorIndex === -1) return false;
          const payload = decoded.slice(0, separatorIndex);
          const sig = decoded.slice(separatorIndex + 1);
          if (!payload || !sig) return false;

      const expectedSig = sign(payload);
          const sigBuf = Buffer.from(sig);
          const expectedBuf = Buffer.from(expectedSig);
          if (sigBuf.length !== expectedBuf.length) return false;
          if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

      const tsStr = payload.split(':')[1];
          const ts = parseInt(tsStr, 10);
          if (!ts || Date.now() - ts > MAX_AGE_SECONDS * 1000) return false;

      return true;
    } catch {
          return false;
    }
}

// Constant-time PIN comparison so response timing doesn't leak how close a
// guess was.
export function verifyPin(input: string): boolean {
    const expected = process.env.ADMIN_PIN || '';
    if (!expected) return false;
    const inputBuf = Buffer.from(input);
    const expectedBuf = Buffer.from(expected);
    if (inputBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(inputBuf, expectedBuf);
}
