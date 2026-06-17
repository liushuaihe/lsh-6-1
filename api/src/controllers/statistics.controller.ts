import type { Request, Response } from 'express';
import { statisticsService } from '../services/statistics.service.js';
import { exportService } from '../services/export.service.js';
import type { StatisticsQuery, AchievementQuery } from '../../../shared/types.js';

export class StatisticsController {
  getYearlyStatistics(req: Request, res: Response) {
    try {
      const query: StatisticsQuery = {
        startYear: req.query.startYear ? parseInt(req.query.startYear as string) : undefined,
        endYear: req.query.endYear ? parseInt(req.query.endYear as string) : undefined,
        userId: req.query.userId as string,
        type: req.query.type as StatisticsQuery['type']
      };

      const stats = statisticsService.getYearlyStatistics(query);
      res.json(stats);
    } catch (error) {
      console.error('Get yearly statistics error:', error);
      res.status(500).json({ error: '获取年度统计失败' });
    }
  }

  getMemberStatistics(req: Request, res: Response) {
    try {
      const query: StatisticsQuery = {
        startYear: req.query.startYear ? parseInt(req.query.startYear as string) : undefined,
        endYear: req.query.endYear ? parseInt(req.query.endYear as string) : undefined,
        userId: req.query.userId as string,
        type: req.query.type as StatisticsQuery['type']
      };

      const stats = statisticsService.getMemberStatistics(query);
      res.json(stats);
    } catch (error) {
      console.error('Get member statistics error:', error);
      res.status(500).json({ error: '获取成员统计失败' });
    }
  }

  getTypeStatistics(req: Request, res: Response) {
    try {
      const query: StatisticsQuery = {
        startYear: req.query.startYear ? parseInt(req.query.startYear as string) : undefined,
        endYear: req.query.endYear ? parseInt(req.query.endYear as string) : undefined,
        userId: req.query.userId as string,
        type: req.query.type as StatisticsQuery['type']
      };

      const stats = statisticsService.getTypeStatistics(query);
      res.json(stats);
    } catch (error) {
      console.error('Get type statistics error:', error);
      res.status(500).json({ error: '获取类型统计失败' });
    }
  }

  getDashboardStats(req: Request, res: Response) {
    try {
      const stats = statisticsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: '获取仪表盘统计失败' });
    }
  }

  exportExcel(req: Request, res: Response) {
    try {
      const query: AchievementQuery = {
        type: req.query.type as AchievementQuery['type'],
        userId: req.query.userId as string,
        keyword: req.query.keyword as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      const buffer = exportService.exportToExcel(query);
      const filename = `科研成果清单_${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      res.send(buffer);
    } catch (error) {
      console.error('Export excel error:', error);
      res.status(500).json({ error: '导出Excel失败' });
    }
  }
}

export const statisticsController = new StatisticsController();
