import { Request, Response, NextFunction } from "express";
import PageModel from "../models/page.model";
import ErrorHandler from "../utils/ErrorHandler";
import { normalizeDistrictName } from "../constants/districts";

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveUploadedBannerImage = (req: Request) => {
    const files = req.files as Express.MulterS3.File[] | undefined;
    const file = req.file as Express.MulterS3.File | undefined;

    if (files && files.length > 0) {
        return files[0]?.location || "";
    }

    return file?.location || "";
};

const normalizeBannerImage = (req: Request) => {
    const uploadedBannerImage = resolveUploadedBannerImage(req);
    const hasBannerImageField = Object.prototype.hasOwnProperty.call(req.body, "bannerImage");
    const requestedBannerImage = typeof req.body.bannerImage === "string"
        ? req.body.bannerImage.trim()
        : "";

    if (uploadedBannerImage) {
        return uploadedBannerImage;
    }

    if (hasBannerImageField) {
        return requestedBannerImage;
    }

    return undefined;
};

// ── PUBLIC: Get all pages by section ──────────────────────────────────────
export const getPagesBySection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const section = req.params.section as string;

        if (!['services', 'districts'].includes(section)) {
            return next(new ErrorHandler("Invalid section type", 400));
        }

        const pages = await PageModel.find({ section })
            .populate('author', 'name email avatar role')
            .sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            pages,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch pages", 500));
    }
};

// ── PUBLIC: Get a single page by ID ───────────────────────────────────────
export const getPageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = await PageModel.findById(req.params.id)
            .populate('author', 'name email avatar role');

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            page,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch page", 500));
    }
};

// ── ADMIN: Create a page ──────────────────────────────────────────────────
export const createPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            city,
            content,
            section,
            status,
            order,
            township,
            population,
            budget,
        } = req.body;
        const authorId = req.user?._id;
        const normalizedBannerImage = normalizeBannerImage(req);

        if (!title || !content || !section) {
            return next(new ErrorHandler("Please complete all required fields.", 400));
        }

        if (!['services', 'districts'].includes(section)) {
            return next(new ErrorHandler("Invalid section type", 400));
        }

        const normalizedCity = section === "districts" ? normalizeDistrictName(city) : "";

        const page = await PageModel.create({
            title,
            city: normalizedCity,
            content,
            section,
            status: status || "Draft",
            bannerImage: normalizedBannerImage || '',
            author: authorId,
            order: toNumber(order, 0),
            township: section === "districts" ? township || "" : "",
            population: section === "districts" ? toNumber(population, 0) : 0,
            budget: section === "districts" ? toNumber(budget, 0) : 0,
        });

        res.status(201).json({
            success: true,
            page,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to create page", 500));
    }
};

// ── ADMIN: Update a page ──────────────────────────────────────────────────
export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body } as Record<string, unknown>;
        const bannerImage = normalizeBannerImage(req);

        if (updateData.order !== undefined) {
            updateData.order = toNumber(updateData.order, 0);
        }

        if (typeof updateData.city === "string") {
            updateData.city = normalizeDistrictName(updateData.city);
        }

        if (updateData.population !== undefined) {
            updateData.population = toNumber(updateData.population, 0);
        }

        if (updateData.budget !== undefined) {
            updateData.budget = toNumber(updateData.budget, 0);
        }

        if (updateData.section === "services") {
            updateData.city = "";
            updateData.township = "";
            updateData.population = 0;
            updateData.budget = 0;
        }

        if (bannerImage !== undefined) {
            updateData.bannerImage = bannerImage;
        }

        const page = await PageModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            page,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to update page", 500));
    }
};

// ── ADMIN: Delete a page ──────────────────────────────────────────────────
export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = await PageModel.findByIdAndDelete(req.params.id);

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Page deleted successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to delete page", 500));
    }
};

export const uploadPageImage = (req: Request, res: Response, next: NextFunction) => {
    const bannerImage = resolveUploadedBannerImage(req);

    if (!bannerImage) {
        return next(new ErrorHandler("No image files provided.", 400));
    }

    res.status(200).json({
        success: true,
        url: bannerImage,
        urls: [bannerImage],
    });
};
