import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { createNews, deleteNews, getAllNews, getNewsById, updateNews, uploadImage, toggleLikeNews } from "../controllers/news.controller";
import { uploadS3 } from "../middlewares/upload";

const newsRouter = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come before parameterized routes (/:id)!

// Public Routes - Allowing website visitors to read Data!
newsRouter.get('/', getAllNews);

// Protected Routes - Any authenticated user can submit news.
newsRouter.post('/', isAuthenticated, authorizeRoles([0, 1, 2, 3]), uploadS3.array('images', 20), createNews);

// S3 Image Upload endpoint — MUST be before /:id or Express mistakes "upload" for an ID
newsRouter.post('/upload', isAuthenticated, authorizeRoles([0, 1, 2, 3]), uploadS3.any(), uploadImage);

// Parameterized routes LAST
newsRouter.get('/:id', getNewsById);
newsRouter.put('/:id/like', isAuthenticated, toggleLikeNews);
newsRouter.patch('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.array('images', 20), updateNews);
newsRouter.delete('/:id', isAuthenticated, deleteNews);

export default newsRouter;
