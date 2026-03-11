import { Request, Response, NextFunction } from "express";
import CommentModel from "../models/comment.model";
import ErrorHandler from "../utils/ErrorHandler";

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId } = req.params;
        const { content } = req.body;

        // This is safe because req.user is appended by isAuthenticated middleware
        const authorId = req.user?._id;

        if (!content) {
            return next(new ErrorHandler("Comment content is required", 400));
        }

        const comment = await CommentModel.create({
            content,
            newsId: newsId as any,
            author: authorId as any,
        });

        // We run populate dynamically right after creation so the Frontend gets the updated name+avatar immediately
        if (comment) {
            await (comment as any).populate('author', 'name avatar role');
        }

        res.status(201).json({
            success: true,
            comment,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

export const getCommentsByNewsId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId } = req.params;
        // Fetch all comments matching News ID, populate authors, limit payload
        const comments = await CommentModel.find({ newsId })
            .populate('author', 'name avatar role')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            comments,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};
