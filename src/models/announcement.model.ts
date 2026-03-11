import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    documentImages: string[];
    publishedDate: Date;
    referenceNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const announcementSchema: Schema<IAnnouncement> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please enter the announcement title'],
        },
        documentImages: {
            type: [String],
            default: [],
            required: [true, 'Document images are missing'],
        },
        publishedDate: {
            type: Date,
            required: [true, 'Published date is required'],
        },
        referenceNumber: {
            type: String,
        }
    },
    { timestamps: true }
);

const announcementModel: Model<IAnnouncement> = mongoose.model('announcements', announcementSchema);
export default announcementModel;
