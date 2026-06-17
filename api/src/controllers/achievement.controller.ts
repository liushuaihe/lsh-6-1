import type { Request, Response } from 'express';
import { achievementService } from '../services/achievement.service.js';
import { db } from '../data/database.js';
import type { CreateAchievementRequest, UpdateAchievementRequest, AchievementQuery } from '../../../shared/types.js';

export class AchievementController {
  getAchievements(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const query: AchievementQuery = {
        type: req.query.type as AchievementQuery['type'],
        status: req.query.status as AchievementQuery['status'],
        userId: req.query.userId as string,
        keyword: req.query.keyword as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined
      };

      const result = achievementService.getAchievements(query, req.user);
      res.json(result);
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({ error: '获取成果列表失败' });
    }
  }

  getAchievementById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const { id } = req.params;
      const achievement = achievementService.getAchievementById(id, req.user);
      
      if (!achievement) {
        return res.status(404).json({ error: '成果不存在或无权限查看' });
      }

      res.json(achievement);
    } catch (error) {
      console.error('Get achievement error:', error);
      res.status(500).json({ error: '获取成果详情失败' });
    }
  }

  createAchievement(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const data = req.body as CreateAchievementRequest;
      
      if (!data.type || !data.title) {
        return res.status(400).json({ error: '成果类型和标题不能为空' });
      }

      if (!data.members || data.members.length === 0) {
        return res.status(400).json({ error: '至少需要添加一位参与成员' });
      }

      const submitter = db.users.findById(req.user.id);
      if (!submitter) {
        return res.status(404).json({ error: '用户不存在' });
      }

      const achievement = achievementService.createAchievement(data, submitter);
      res.status(201).json(achievement);
    } catch (error) {
      console.error('Create achievement error:', error);
      res.status(500).json({ error: '创建成果失败' });
    }
  }

  updateAchievement(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const { id } = req.params;
      const data = req.body as UpdateAchievementRequest;

      const achievement = achievementService.updateAchievement(id, data, req.user);
      
      if (!achievement) {
        return res.status(404).json({ error: '成果不存在、无权限编辑或正在审核中' });
      }

      res.json(achievement);
    } catch (error) {
      console.error('Update achievement error:', error);
      res.status(500).json({ error: '更新成果失败' });
    }
  }

  deleteAchievement(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const { id } = req.params;
      const success = achievementService.deleteAchievement(id, req.user);
      
      if (!success) {
        return res.status(404).json({ error: '成果不存在、无权限删除或正在审核中' });
      }

      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('Delete achievement error:', error);
      res.status(500).json({ error: '删除成果失败' });
    }
  }

  submitForReview(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const { id } = req.params;
      const achievement = achievementService.submitForReview(id, req.user);
      
      if (!achievement) {
        return res.status(400).json({ error: '提交失败，请检查成果状态' });
      }

      res.json(achievement);
    } catch (error) {
      console.error('Submit for review error:', error);
      res.status(500).json({ error: '提交审核失败' });
    }
  }

  getStats(req: Request, res: Response) {
    try {
      const stats = achievementService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: '获取统计数据失败' });
    }
  }
}

export const achievementController = new AchievementController();
