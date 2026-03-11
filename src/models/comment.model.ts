import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IComment extends Document {
    content: string;
    newsId: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
}

const commentSchema: Schema<IComment> = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, 'Please enter a comment'],
        },
        newsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'news', // Link back to the specific article
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users', // Link to the user who wrote it
            required: true,
        }
    },
    { timestamps: true }
);

// We export the model using Mongoose structure
const commentModel: Model<IComment> = mongoose.model('Comment', commentSchema);
export default commentModel;
