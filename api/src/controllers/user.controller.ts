import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import type { CreateUserRequest, UpdateUserRequest } from '../../../shared/types.js';

export class UserController {
  getAllUsers(req: Request, res: Response) {
    try {
      const users = userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: '获取用户列表失败' });
    }
  }

  getActiveUsers(req: Request, res: Response) {
    try {
      const users = userService.getActiveUsers();
      res.json(users);
    } catch (error) {
      console.error('Get active users error:', error);
      res.status(500).json({ error: '获取用户列表失败' });
    }
  }

  getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  createUser(req: Request, res: Response) {
    try {
      const data = req.body as CreateUserRequest;
      
      if (!data.username || !data.password || !data.name || !data.role || !data.department) {
        return res.status(400).json({ error: '必填字段不能为空' });
      }

      if (data.password.length < 6) {
        return res.status(400).json({ error: '密码长度不能少于6位' });
      }

      const user = userService.createUser(data);
      
      if (!user) {
        return res.status(400).json({ error: '用户名已存在' });
      }

      res.status(201).json(user);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: '创建用户失败' });
    }
  }

  updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateUserRequest;
      
      const user = userService.updateUser(id, data);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: '更新用户失败' });
    }
  }

  deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const success = userService.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: '删除用户失败' });
    }
  }

  toggleUserActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = userService.toggleUserActive(id);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json(user);
    } catch (error) {
      console.error('Toggle user active error:', error);
      res.status(500).json({ error: '操作失败' });
    }
  }
}

export const userController = new UserController();
