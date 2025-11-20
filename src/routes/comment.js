import express from "express";
import {
    getCommentsByPostId,
    createComment,
    deleteComment
} from "../controllers/comment.js";

const router = express.Router();

router.get("/post/:postId", getCommentsByPostId);
router.post("/", createComment);
router.delete("/:id", deleteComment);

export default router;