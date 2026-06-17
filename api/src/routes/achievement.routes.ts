import { Router } from 'express';
import { achievementController } from '../controllers/achievement.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, achievementController.getAchievements);
router.get('/stats', authenticateToken, achievementController.getStats);
router.get('/:id', authenticateToken, achievementController.getAchievementById);
router.post('/', authenticateToken, achievementController.createAchievement);
router.put('/:id', authenticateToken, achievementController.updateAchievement);
router.delete('/:id', authenticateToken, achievementController.deleteAchievement);
router.post('/:id/submit', authenticateToken, achievementController.submitForReview);

export default router;
