import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAbout extends Document {
    title: string;
    description: string;
    policy: string;
    objective: string;
    imageUrl: string;
}

const aboutSchema: Schema<IAbout> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please enter the title'],
        },
        description: {
            type: String,
            required: [true, 'Please enter the description'],
        },
        policy: {
            type: String,
            required: [true, 'Please enter the policy'],
        },
        objective: {
            type: String,
            required: [true, 'Please enter the objective'],
        },
        imageUrl: {
            type: String,
            default: '',
        }
    },
    { timestamps: true }
);

const aboutModel: Model<IAbout> = mongoose.model('About', aboutSchema);
export default aboutModel;
