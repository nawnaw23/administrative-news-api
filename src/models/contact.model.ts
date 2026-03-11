import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContactMessage extends Document {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    isRead: boolean;
}

const contactMessageSchema: Schema<IContactMessage> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Please enter a subject'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Please enter a message'],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const ContactMessageModel: Model<IContactMessage> = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessageModel;
