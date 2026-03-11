import { Request, Response, NextFunction } from "express";
import AboutModel from "../models/about.model";
import ErrorHandler from "../utils/ErrorHandler";

// ── PUBLIC: Get About Content ──────────────────────────────────────
export const getAboutContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const about = await AboutModel.findOne().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            about: about || null,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch about content", 500));
    }
};

// ── ADMIN: Create or Update About Content ──────────────────────────────────────────────────
export const saveAboutContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, policy, objective, imageUrl } = req.body;

        if (!title || !description || !policy || !objective) {
            return next(new ErrorHandler("Please fill out all required fields.", 400));
        }

        let about = await AboutModel.findOne();

        if (about) {
            about.title = title;
            about.description = description;
            about.policy = policy;
            about.objective = objective;
            if (imageUrl !== undefined) {
                about.imageUrl = imageUrl;
            }
            await about.save();
        } else {
            about = await AboutModel.create({
                title,
                description,
                policy,
                objective,
                imageUrl: imageUrl || '',
            });
        }

        res.status(200).json({
            success: true,
            about,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to save about content", 500));
    }
};
