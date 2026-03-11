import { Types } from "mongoose";
import {
    MAIN_CATEGORIES,
    MAIN_CATEGORY_SLUGS,
    slugifyCategoryTitle,
} from "../constants/categories";
import CategoryModel from "../models/category.model";

const MAIN_CATEGORY_SLUG_LIST = MAIN_CATEGORIES.map((category) => category.slug);

export const syncMainCategories = async () => {
    await Promise.all(
        MAIN_CATEGORIES.map((category) =>
            CategoryModel.findOneAndUpdate(
                { slug: category.slug },
                {
                    $setOnInsert: {
                        createdBy: "system",
                    },
                    $set: {
                        title: category.title,
                        description: category.description,
                    },
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                }
            )
        )
    );
};

export const resolveMainCategory = async ({
    categoryId,
    category,
}: {
    categoryId?: unknown;
    category?: unknown;
}) => {
    await syncMainCategories();

    if (typeof categoryId === "string" && Types.ObjectId.isValid(categoryId)) {
        const categoryDoc = await CategoryModel.findOne({
            _id: categoryId,
            slug: { $in: MAIN_CATEGORY_SLUG_LIST },
        });

        if (categoryDoc) {
            return categoryDoc;
        }
    }

    if (typeof category === "string") {
        const normalizedCategory = category.trim();
        const slug = slugifyCategoryTitle(normalizedCategory);

        if (normalizedCategory && MAIN_CATEGORY_SLUGS.has(slug)) {
            return CategoryModel.findOne({
                slug,
            });
        }
    }

    return null;
};
