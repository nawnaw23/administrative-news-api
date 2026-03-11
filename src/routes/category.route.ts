import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/category.controller";

const categoryRouter = express.Router();

// Allow public to fetch categories for the Client Site
categoryRouter.get("/", getAllCategories);

// Only Staff(1), Admin(2), and Root_Admin(3) can manage categories
categoryRouter.post("/", isAuthenticated, authorizeRoles([1, 2, 3]), createCategory);
categoryRouter.patch("/:id", isAuthenticated, authorizeRoles([1, 2, 3]), updateCategory);
categoryRouter.delete("/:id", isAuthenticated, authorizeRoles([1, 2, 3]), deleteCategory);

export default categoryRouter;
