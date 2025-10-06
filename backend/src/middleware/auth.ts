import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  userId?: string;
  role?: 'customer' | 'supplier' | 'agent' | 'admin';
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.header('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}


