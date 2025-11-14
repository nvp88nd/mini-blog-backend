import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    getUserById
} from '../controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.get('/profile/:id', getUserById);

export default router;