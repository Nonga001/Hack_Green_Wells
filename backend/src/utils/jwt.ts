import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string; // user id
  role: 'customer' | 'supplier' | 'agent' | 'admin';
}

export function signToken(payload: JwtPayload, expiresIn: string = '7d'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.verify(token, secret) as JwtPayload;
}
