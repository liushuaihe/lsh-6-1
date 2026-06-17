import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { db } from '../data/database.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
      };
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : null;

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: '认证令牌无效或已过期' });
  }

  const user = db.users.findById(decoded.userId);
  if (!user || !user.isActive) {
    return res.status(403).json({ error: '用户不存在或已被禁用' });
  }

  req.user = {
    id: user.id,
    username: decoded.username,
    role: decoded.role
  };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
}
