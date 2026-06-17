import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jwtConfig } from '../config/jwt.js';
import type { User } from '../../../shared/types.js';
import type { SignOptions } from 'jsonwebtoken';

export function generateToken(user: User): string {
  const options: SignOptions = {
    expiresIn: 7 * 24 * 60 * 60
  };
  return jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    },
    jwtConfig.secret as string,
    options
  );
}

export function verifyToken(token: string): { userId: string; username: string; role: string } | null {
  try {
    return jwt.verify(token, jwtConfig.secret) as { userId: string; username: string; role: string };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
