import { Request, Response, NextFunction } from "express";
import AnnouncementModel from "../models/announcement.model";
import ErrorHandler from "../utils/ErrorHandler";

// Create an Announcement
export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, publishedDate, referenceNumber } = req.body;

        if (!title || !publishedDate) {
            return next(new ErrorHandler("Please enter title and published date.", 400));
        }

        // Get multiple files from Multer S3
        const files = req.files as Express.MulterS3.File[] | undefined;
        let documentImages: string[] = [];

        if (files && files.length > 0) {
            documentImages = files.map(file => file.location);
        } else if (req.body.documentImages) {
            documentImages = Array.isArray(req.body.documentImages) ? req.body.documentImages : [req.body.documentImages];
        }

        if (documentImages.length === 0) {
            return next(new ErrorHandler("Document images are missing.", 400));
        }

        const announcement = await AnnouncementModel.create({
            title,
            publishedDate,
            referenceNumber,
            documentImages,
        });

        res.status(201).json({
            success: true,
            announcement,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to create announcement', 500));
    }
};

// Retrieve all Announcements
export const getAllAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const announcements = await AnnouncementModel.find().sort({ publishedDate: -1 });

        res.status(200).json({
            success: true,
            announcements,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to fetch announcements', 500));
    }
};

// Retrieve ONE Announcement
export const getAnnouncementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const announcement = await AnnouncementModel.findById(req.params.id);

        if (!announcement) {
            return next(new ErrorHandler("Announcement not found.", 404));
        }

        res.status(200).json({
            success: true,
            announcement,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Update existing Announcement
export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const files = req.files as Express.MulterS3.File[] | undefined;
        if (files && files.length > 0) {
            updateData.documentImages = files.map(file => file.location);
        }

        const announcement = await AnnouncementModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!announcement) {
            return next(new ErrorHandler("Announcement not found.", 404));
        }

        res.status(200).json({
            success: true,
            announcement,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to update announcement', 500));
    }
};

// Delete Announcement
export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const announcement = await AnnouncementModel.findByIdAndDelete(id);

        if (!announcement) {
            return next(new ErrorHandler("Announcement not found.", 404));
        }

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully.",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to delete announcement', 500));
    }
};

export const uploadAnnouncementImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.MulterS3.File[] | undefined;

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "Please upload at least one file." });
        }

        const urls = files.map(file => file.location);

        res.status(200).json({
            success: true,
            urls,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
};
