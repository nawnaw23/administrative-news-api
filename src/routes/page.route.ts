import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { uploadS3 } from "../middlewares/upload";
import {
    getPagesBySection,
    getPageById,
    createPage,
    updatePage,
    deletePage,
    uploadPageImage,
} from "../controllers/page.controller";

const pageRouter = express.Router();

// PUBLIC — Get all pages for a section (e.g. /pages/services, /pages/districts)
pageRouter.get('/section/:section', getPagesBySection);
pageRouter.post('/upload', isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.any(), uploadPageImage);
pageRouter.get('/:id', getPageById);

// ADMIN ONLY — CRUD operations
pageRouter.post('/', isAuthenticated, authorizeRoles([1, 2, 3]), createPage);
pageRouter.patch('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), updatePage);
pageRouter.delete('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), deletePage);

export default pageRouter;
