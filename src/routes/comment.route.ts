import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { createComment, getCommentsByNewsId } from "../controllers/comment.controller";

const commentRouter = express.Router();

// Public: Anyone can read comments matching a news post id
commentRouter.get('/:newsId', getCommentsByNewsId);

// Protected: Only Logged in Users can POST a comment
commentRouter.post('/:newsId', isAuthenticated, createComment);

export default commentRouter;
