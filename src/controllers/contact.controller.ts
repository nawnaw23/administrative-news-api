import { Request, Response, NextFunction } from "express";
import ContactMessageModel from "../models/contact.model";
import ErrorHandler from "../utils/ErrorHandler";

// ── PUBLIC: Submit a contact message ──────────────────────────────────────
export const createContactMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return next(new ErrorHandler("Please fill in all required fields.", 400));
        }

        const contact = await ContactMessageModel.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully.",
            contact,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to send message", 500));
    }
};

// ── ADMIN: Get all contact messages ───────────────────────────────────────
export const getAllContactMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contacts = await ContactMessageModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            contacts,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch messages", 500));
    }
};

// ── ADMIN: Mark a message as read ─────────────────────────────────────────
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contact = await ContactMessageModel.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!contact) {
            return next(new ErrorHandler("Message not found", 404));
        }

        res.status(200).json({
            success: true,
            contact,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to update message", 500));
    }
};

// ── ADMIN: Delete a contact message ───────────────────────────────────────
export const deleteContactMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contact = await ContactMessageModel.findByIdAndDelete(req.params.id);

        if (!contact) {
            return next(new ErrorHandler("Message not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to delete message", 500));
    }
};
