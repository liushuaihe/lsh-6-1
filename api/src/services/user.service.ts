import { db } from '../data/database.js';
import { hashPassword } from '../utils/auth.js';
import { setPasswordHash } from '../data/database.js';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../../shared/types.js';

export class UserService {
  getAllUsers(): User[] {
    return db.users.findAll().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getActiveUsers(): User[] {
    return db.users.findAll()
      .filter(u => u.isActive)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  }

  getUserById(id: string): User | null {
    return db.users.findById(id) || null;
  }

  createUser(data: CreateUserRequest): User | null {
    const existing = db.users.findByUsername(data.username);
    if (existing) {
      return null;
    }

    const passwordHash = hashPassword(data.password);
    const user = db.users.create({
      username: data.username,
      name: data.name,
      role: data.role,
      email: data.email,
      studentId: data.studentId,
      title: data.title,
      department: data.department,
      isActive: true
    });

    setPasswordHash(data.username, passwordHash);
    return user;
  }

  updateUser(id: string, data: UpdateUserRequest): User | null {
    return db.users.update(id, data) || null;
  }

  deleteUser(id: string): boolean {
    return db.users.delete(id);
  }

  toggleUserActive(id: string): User | null {
    const user = db.users.findById(id);
    if (!user) return null;
    return db.users.update(id, { isActive: !user.isActive }) || null;
  }
}

export const userService = new UserService();
