import jwt from 'jsonwebtoken';
import type {SignOptions} from 'jsonwebtoken';
export interface JwtPayload {
  sub: string; // user id
  role: 'customer' | 'supplier' | 'agent' | 'admin';
}

export function signToken(payload: JwtPayload, expiresIn: string = "7d"): string {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) throw new Error("Missing JWT_SECRET");

  const options: SignOptions = { expiresIn: expiresIn as any }; // 👈 typecast
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  return jwt.verify(token, secret) as JwtPayload;
}
