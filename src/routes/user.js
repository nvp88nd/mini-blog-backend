import express from 'express';
import { upload } from "../middlewares/upload.js";
import {
    getUserById,
    updateUser
} from '../controllers/user.js';

const router = express.Router();

router.get('/:id', getUserById);
router.post('/:id', upload.single('avatar'), updateUser)

export default router;