import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    password: string;
    avatar?: string;
    role: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    signAccessToken(): Promise<string>;
    comparePassword(enteredPassword: string): Promise<boolean>;
}