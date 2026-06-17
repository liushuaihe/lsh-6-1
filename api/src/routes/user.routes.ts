import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, requireRole('advisor', 'admin'), userController.getAllUsers);
router.get('/active', authenticateToken, userController.getActiveUsers);
router.get('/:id', authenticateToken, requireRole('advisor', 'admin'), userController.getUserById);
router.post('/', authenticateToken, requireRole('admin'), userController.createUser);
router.put('/:id', authenticateToken, requireRole('admin'), userController.updateUser);
router.delete('/:id', authenticateToken, requireRole('admin'), userController.deleteUser);
router.patch('/:id/toggle', authenticateToken, requireRole('admin'), userController.toggleUserActive);

export default router;
