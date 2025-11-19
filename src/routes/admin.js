import express from "express";
import {
    getDashboardStats,
    getAllUsers,
    getAllPostsAdmin,
    deleteUserById,
    deletePostById,
    toggleUserStatus
} from "../controllers/admin.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/posts", getAllPostsAdmin);
router.delete("/users/:id", deleteUserById);
router.delete("/posts/:id", deletePostById);
router.patch("/users/:id/toggle-status", toggleUserStatus);

export default router;