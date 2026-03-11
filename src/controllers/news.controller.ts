import { Request, Response, NextFunction } from "express";
import NewsModel from "../models/news.model";
import { resolveMainCategory } from "../utils/category-catalog";
import ErrorHandler from "../utils/ErrorHandler";

const toArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }

    if (typeof value === "string" && value.trim()) {
        return [value];
    }

    return [];
};

const resolveUploadedUrls = (req: Request): string[] => {
    const files = req.files as Express.MulterS3.File[] | undefined;
    const file = req.file as Express.MulterS3.File | undefined;

    if (files && files.length > 0) {
        return files.map((uploadedFile) => uploadedFile.location);
    }

    if (file?.location) {
        return [file.location];
    }

    return [];
};

const normalizeNewsPayload = (req: Request) => {
    const uploadedUrls = resolveUploadedUrls(req);
    const requestedImages = toArray(req.body.images);
    const requestedBannerImage = typeof req.body.bannerImage === "string" ? req.body.bannerImage.trim() : "";

    const images = uploadedUrls.length > 0
        ? uploadedUrls
        : requestedImages.length > 0
            ? requestedImages
            : requestedBannerImage
                ? [requestedBannerImage]
                : [];

    const bannerImage = requestedBannerImage || images[0] || "";

    return {
        images,
        bannerImage,
    };
};

const serializeNews = (news: any) => {
    const plainNews = typeof news.toObject === "function" ? news.toObject() : news;
    const images = Array.isArray(plainNews.images) ? plainNews.images : [];
    const categoryRef = plainNews.categoryId && typeof plainNews.categoryId === "object" && "title" in plainNews.categoryId
        ? plainNews.categoryId
        : null;

    return {
        ...plainNews,
        images,
        category: categoryRef?.title || plainNews.category || "",
        categoryId: categoryRef?._id || plainNews.categoryId || null,
        categoryRef: categoryRef ? {
            _id: categoryRef._id,
            title: categoryRef.title,
            slug: categoryRef.slug,
            description: categoryRef.description || "",
        } : null,
        bannerImage: plainNews.bannerImage || images[0] || "",
    };
};

// Create an Article
export const createNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, category, categoryId, content, status } = req.body;
        const authorId = req.user?._id;

        if (!title || !content || (!category && !categoryId)) {
            return next(new ErrorHandler("Please complete all required fields.", 400));
        }

        const resolvedCategory = await resolveMainCategory({ categoryId, category });
        if (!resolvedCategory) {
            return next(new ErrorHandler("Category must match the main category list.", 400));
        }

        const { images, bannerImage } = normalizeNewsPayload(req);

        const news = await NewsModel.create({
            title,
            category: resolvedCategory.title,
            categoryId: resolvedCategory._id,
            content,
            status: status || "Draft",
            images,
            bannerImage,
            author: authorId,
        });

        res.status(201).json({
            success: true,
            news: serializeNews(await news.populate("categoryId", "title slug description")),
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to create news", 500));
    }
};

// Retrieve all Articles - optionally filtered by ?category= query parameter
export const getAllNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: Record<string, any> = {};
        if (req.query.category) {
            const categoryQuery = String(req.query.category);
            const resolvedCategory = await resolveMainCategory({ category: categoryQuery, categoryId: categoryQuery });

            if (!resolvedCategory) {
                return res.status(200).json({
                    success: true,
                    news: [],
                });
            }

            filter.$or = [
                { categoryId: resolvedCategory._id },
                { category: resolvedCategory.title },
            ];
        }

        const news = await NewsModel.find(filter)
            .populate("categoryId", "title slug description")
            .populate("author", "name email avatar role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            news: news.map((item) => serializeNews(item)),
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch news", 500));
    }
};

// Retrieve just ONE Article by matching the /news/:id
export const getNewsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const news = await NewsModel.findById(req.params.id)
            .populate("categoryId", "title slug description")
            .populate("author", "name email avatar role");

        if (!news) {
            return next(new ErrorHandler("News article not found.", 404));
        }

        res.status(200).json({
            success: true,
            news: serializeNews(news),
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Update an existing Article
export const updateNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body } as Record<string, unknown>;
        const { images, bannerImage } = normalizeNewsPayload(req);

        if (updateData.category !== undefined || updateData.categoryId !== undefined) {
            const resolvedCategory = await resolveMainCategory({
                category: updateData.category,
                categoryId: updateData.categoryId,
            });

            if (!resolvedCategory) {
                return next(new ErrorHandler("Category must match the main category list.", 400));
            }

            updateData.category = resolvedCategory.title;
            updateData.categoryId = resolvedCategory._id;
        }

        if (images.length > 0) {
            updateData.images = images;
        }

        if (bannerImage) {
            updateData.bannerImage = bannerImage;
        }

        const news = await NewsModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate("categoryId", "title slug description");

        if (!news) {
            return next(new ErrorHandler("News not found", 404));
        }

        res.status(200).json({
            success: true,
            news: serializeNews(news),
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Hard Delete Article Data
export const deleteNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const news = await NewsModel.findById(req.params.id);

        if (!news) {
            return next(new ErrorHandler("News not found", 404));
        }

        const requesterId = req.user?._id?.toString();
        const requesterRole = req.user?.role ?? 0;
        const isOwner = requesterId ? news.author.toString() === requesterId : false;

        if (!isOwner && requesterRole < 1) {
            return next(new ErrorHandler("You're not allowed to delete this news post.", 403));
        }

        await news.deleteOne();

        res.status(200).json({
            success: true,
            message: "News deleted successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Image Upload Controller - multer-s3 middleware runs first on the route
export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
    const urls = resolveUploadedUrls(req);
    if (urls.length === 0) {
        return next(new ErrorHandler("No image files provided.", 400));
    }

    res.status(200).json({
        success: true,
        url: urls[0],
        urls,
    });
};

// Toggle Love/Like
export const toggleLikeNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const news = await NewsModel.findById(id);
        if (!news) {
            return next(new ErrorHandler("News article not found.", 404));
        }

        const isLiked = news.likes.some((likedUserId: any) => likedUserId.toString() === userId.toString());

        if (isLiked) {
            news.likes = news.likes.filter((likedUserId: any) => likedUserId.toString() !== userId.toString());
        } else {
            news.likes.push(userId);
        }

        await news.save();

        res.status(200).json({
            success: true,
            news: serializeNews(news),
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};
