import express from "express";
import { upload } from "../middlewares/upload.js";
import {
    getAllPosts,
    getPostById,
    getUserPosts,
    createPost,
    editPost,
    deleteImage,
    deletePost
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:id", getUserPosts);
router.post("/", upload.array("images"), createPost);
router.post("/:id", upload.array("images"), editPost);
router.delete("/images/:id", deleteImage);
router.delete("/:id", deletePost);

export default router;