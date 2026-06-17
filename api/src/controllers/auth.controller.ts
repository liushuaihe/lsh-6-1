import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import type { LoginRequest } from '../../../shared/types.js';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body as LoginRequest;
      
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }

      const result = await authService.login({ username, password });
      
      if (!result) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: '登录失败，请稍后重试' });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const user = await authService.getCurrentUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  async logout(req: Request, res: Response) {
    res.json({ message: '登出成功' });
  }

  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const { oldPassword, newPassword } = req.body;
      
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: '旧密码和新密码不能为空' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: '新密码长度不能少于6位' });
      }

      const success = await authService.changePassword(req.user.id, oldPassword, newPassword);
      
      if (!success) {
        return res.status(400).json({ error: '旧密码错误' });
      }

      res.json({ message: '密码修改成功' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: '密码修改失败' });
    }
  }
}

export const authController = new AuthController();
