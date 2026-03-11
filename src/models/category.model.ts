import { model, Schema } from "mongoose";
import { ICategory } from "../types/ICategory";

const categorySchema: Schema<ICategory> = new Schema({
    title: {
        type: String,
        required: [true, "Please enter category title"],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
    },
    createdBy: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const CategoryModel = model<ICategory>("categories", categorySchema);
export default CategoryModel;
