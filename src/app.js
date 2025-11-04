import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postRouter from "./routes/post.js";
import commentRouter from "./routes/comment.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/auth", authRouter);

export default app;
