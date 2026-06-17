import { Router } from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/pending', authenticateToken, requireRole('advisor', 'admin'), reviewController.getPendingAchievements);
router.get('/history/:achievementId', authenticateToken, reviewController.getReviewHistory);
router.post('/:id', authenticateToken, requireRole('advisor', 'admin'), reviewController.reviewAchievement);

export default router;
