import type { Request, Response } from 'express';
import { reviewService } from '../services/review.service.js';
import { db } from '../data/database.js';
import type { ReviewRequest } from '../../../shared/types.js';

export class ReviewController {
  getPendingAchievements(req: Request, res: Response) {
    try {
      const achievements = reviewService.getPendingAchievements();
      res.json(achievements);
    } catch (error) {
      console.error('Get pending achievements error:', error);
      res.status(500).json({ error: '获取待审核列表失败' });
    }
  }

  getReviewHistory(req: Request, res: Response) {
    try {
      const { achievementId } = req.params;
      const logs = reviewService.getReviewHistory(achievementId);
      res.json(logs);
    } catch (error) {
      console.error('Get review history error:', error);
      res.status(500).json({ error: '获取审核历史失败' });
    }
  }

  reviewAchievement(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未登录' });
      }

      const { id } = req.params;
      const data = req.body as ReviewRequest;
      
      if (!data.status) {
        return res.status(400).json({ error: '审核状态不能为空' });
      }

      const reviewer = db.users.findById(req.user.id);
      if (!reviewer) {
        return res.status(404).json({ error: '用户不存在' });
      }

      const achievement = reviewService.reviewAchievement(id, data, {
        id: reviewer.id,
        name: reviewer.name
      });
      
      if (!achievement) {
        return res.status(404).json({ error: '成果不存在或状态不正确' });
      }

      res.json(achievement);
    } catch (error) {
      console.error('Review achievement error:', error);
      res.status(500).json({ error: '审核失败' });
    }
  }
}

export const reviewController = new ReviewController();
