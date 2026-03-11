import { Request, Response, NextFunction } from "express";
import CatchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import {
    CATEGORY_ORDER,
    MAIN_CATEGORIES,
    MAIN_CATEGORY_TITLES,
    slugifyCategoryTitle,
} from "../constants/categories";
import CategoryModel from "../models/category.model";
import { syncMainCategories } from "../utils/category-catalog";

// Create category
export const createCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description } = req.body;

    if (!title) {
        return next(new ErrorHandler("Please enter category title", 400));
    }

    if (!MAIN_CATEGORY_TITLES.has(title)) {
        return next(new ErrorHandler("Category must match the main category list.", 400));
    }

    const slug = slugifyCategoryTitle(title);

    const categoryExists = await CategoryModel.findOne({ slug });
    if (categoryExists) {
        return next(new ErrorHandler("Category already exists", 400));
    }

    const createdBy = req.user._id.toString();

    const category = await CategoryModel.create({
        title,
        slug,
        description,
        createdBy
    });

    res.status(201).json({
        success: true,
        category,
    });
});

// Get all categories
export const getAllCategories = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    await syncMainCategories();

    const categories = await CategoryModel.find({
        slug: { $in: MAIN_CATEGORIES.map((category) => category.slug) },
    });

    categories.sort((left, right) => {
        const leftOrder = CATEGORY_ORDER.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = CATEGORY_ORDER.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder;
    });

    res.status(200).json({
        success: true,
        categories,
    });
});

// Update category
export const updateCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const category = await CategoryModel.findById(id);
    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    if (title) {
        if (!MAIN_CATEGORY_TITLES.has(title)) {
            return next(new ErrorHandler("Category must match the main category list.", 400));
        }

        category.title = title;
        category.slug = slugifyCategoryTitle(title);

        const categoryExists = await CategoryModel.findOne({ slug: category.slug, _id: { $ne: category._id } });
        if (categoryExists) {
            return next(new ErrorHandler("Category title already exists", 400));
        }
    }

    if (description !== undefined) {
        category.description = description;
    }

    const updatedCategory = await category.save();

    res.status(200).json({
        success: true,
        category: updatedCategory,
    });
});

// Delete category
export const deleteCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const category = await CategoryModel.findById(id);
    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});
