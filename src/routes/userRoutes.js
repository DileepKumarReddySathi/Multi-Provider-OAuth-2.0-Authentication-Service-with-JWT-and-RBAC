import express from 'express';
import { getMe, updateMe, getAllUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/', authorizeRole('admin'), getAllUsers);

export default router;
