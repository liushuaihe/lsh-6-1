import { db, getPasswordHash, setPasswordHash } from '../data/database.js';
import { generateToken, comparePassword, hashPassword } from '../utils/auth.js';
import type { LoginRequest, LoginResponse, User } from '../../../shared/types.js';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse | null> {
    const user = db.users.findByUsername(credentials.username);
    if (!user || !user.isActive) {
      return null;
    }

    const storedHash = getPasswordHash(credentials.username);
    if (!storedHash || !comparePassword(credentials.password, storedHash)) {
      return null;
    }

    const token = generateToken(user);
    return { token, user };
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return db.users.findById(userId) || null;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = db.users.findById(userId);
    if (!user) return false;

    const storedHash = getPasswordHash(user.username);
    if (!storedHash || !comparePassword(oldPassword, storedHash)) {
      return false;
    }

    const newHash = hashPassword(newPassword);
    setPasswordHash(user.username, newHash);
    return true;
  }
}

export const authService = new AuthService();
