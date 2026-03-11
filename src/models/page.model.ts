import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPage extends Document {
    title: string;
    city?: string;
    content: string;       // Rich HTML from TipTap
    bannerImage: string;   // S3 URL
    section: 'services' | 'districts';
    status: 'Draft' | 'Published';
    author: mongoose.Types.ObjectId;
    order: number;         // Manual sort order for CMS pages
    township?: string;
    population?: number;
    budget?: number;
}

const pageSchema: Schema<IPage> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please enter the page title'],
            trim: true,
        },
        city: {
            type: String,
            trim: true,
            default: '',
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        bannerImage: {
            type: String,
            default: '',
        },
        section: {
            type: String,
            enum: ['services', 'districts'],
            required: [true, 'Section type is required'],
        },
        status: {
            type: String,
            enum: ['Draft', 'Published'],
            default: 'Draft',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        township: {
            type: String,
            trim: true,
            default: '',
        },
        population: {
            type: Number,
            default: 0,
            min: 0,
        },
        budget: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

const PageModel: Model<IPage> = mongoose.model('Page', pageSchema);
export default PageModel;
