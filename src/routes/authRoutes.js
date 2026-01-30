import express from 'express';
import { register, login, googleInit, googleCallback, githubInit, githubCallback, refresh } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// OAuth
router.get('/google', googleInit);
router.get('/google/callback', googleCallback);
router.get('/github', githubInit);
router.get('/github/callback', githubCallback);
router.post('/refresh', refresh);

export default router;
