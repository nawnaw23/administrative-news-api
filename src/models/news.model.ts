import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INews extends Document {
    title: string;
    category: string;
    categoryId?: mongoose.Types.ObjectId;
    content: string; // The rich HTML from Tiptap
    bannerImage: string;
    images: string[];
    status: "Draft" | "Published";
    author: mongoose.Types.ObjectId; // The User who wrote it
    likes: mongoose.Types.ObjectId[]; // The Users who liked it
}

const newsSchema: Schema<INews> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please enter the news title'],
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories',
            default: null,
        },
        content: {
            type: String,
            required: [true, 'Content is missing'],
        },
        bannerImage: {
            type: String,
            default: '',
        },
        images: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ["Draft", "Published"],
            default: "Draft"
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                default: [],
            }
        ]
    },
    { timestamps: true }
);

const newsModel: Model<INews> = mongoose.model('news', newsSchema);
export default newsModel;
