import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { getAboutContent, saveAboutContent } from "../controllers/about.controller";

const aboutRouter = express.Router();

// PUBLIC
aboutRouter.get('/', getAboutContent);

// ADMIN ONLY - Create or Update
aboutRouter.post('/', isAuthenticated, authorizeRoles([1, 2, 3]), saveAboutContent);
aboutRouter.put('/', isAuthenticated, authorizeRoles([1, 2, 3]), saveAboutContent);

export default aboutRouter;
