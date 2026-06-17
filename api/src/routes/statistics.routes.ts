import { Router } from 'express';
import { statisticsController } from '../controllers/statistics.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticateToken, statisticsController.getDashboardStats);
router.get('/yearly', authenticateToken, statisticsController.getYearlyStatistics);
router.get('/members', authenticateToken, statisticsController.getMemberStatistics);
router.get('/types', authenticateToken, statisticsController.getTypeStatistics);
router.get('/export/excel', authenticateToken, statisticsController.exportExcel);

export default router;
