import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);
router.post('/change-password', authenticateToken, authController.changePassword);

export default router;
