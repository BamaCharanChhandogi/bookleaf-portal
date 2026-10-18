import { SignJWT, jwtVerify } from 'jose';

// Single source of truth for JWT signing secret across Edge Middleware and Node API routes
const SECRET_STRING = 'bookleaf-enterprise-secret-key-2026-production';
const JWT_SECRET = new TextEncoder().encode(SECRET_STRING);

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: 'AUTHOR' | 'ADMIN';
  city?: string | null;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err: any) {
    console.error('[Session Verify Error]:', err?.message);
    return null;
  }
}
