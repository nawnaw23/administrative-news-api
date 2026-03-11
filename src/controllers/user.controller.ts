import { NextFunction, Request, Response } from "express";
import CatchAsyncError from "../middlewares/catchAsyncError";
import { IUser } from "../types/IUser";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/user.model";
import { uploadS3 } from "../middlewares/upload";

// Register User
export const register = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password, phone } = req.body as Partial<IUser>;

        if (!name || !email || !password) {
            return next(new ErrorHandler("Please enter all required fields", 400))
        }

        const isEmailExist = await UserModel.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists!", 400))
        }

        const user = await UserModel.create({ name, email, password, phone });

        res.status(201).json({
            success: true,
            user,
        })
    }
);

// Login User
export const login = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body as Partial<IUser>;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400))
        }

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid Credentials!", 403))
        }

        if (!user.active) {
            return next(new ErrorHandler("Your account has been deactivated. Please contact support.", 403))
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid Credentials!", 403))
        }
        const accessToken = await user.signAccessToken();

        res.status(201).json({
            success: true,
            accessToken,
            user,
        })
    }
);

// Get Current User Info
export const getCurrentUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user._id) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user: req.user,
        })
    }
);

// Get User Info By Id
export const getUserById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user,
        })
    }
);

// Get All Users
export const getAllUsers = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const users = await UserModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users,
        })
    }
);

// Update user info
export const updateUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, phone, active } = req.body as Partial<IUser>;
        const currentUserId = req.user._id;

        const user = await UserModel.findById(currentUserId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (active !== user.active) user.active = active;
        if (email && email !== user.email) {
            const isEmailExist = await UserModel.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exists", 400));
            }
            user.email = email;
        }

        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Update user password
type TUpdatePwdReq = {
    oldPassword: string;
    newPassword: string;
}
export const updateUserPassword = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user._id;
        const { oldPassword, newPassword } = req.body as TUpdatePwdReq;
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Old and new passwords are required", 400));
        }

        const user = await UserModel.findById(currentUserId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isPasswordMatch = await user.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Incorrect old password", 400));
        }

        user.password = newPassword;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Upload user avatar
export const uploadUserAvatar = [
    uploadS3.any(),
    CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user._id;
        // AWS provides public URL natively inside location
        const files = req.files as Express.MulterS3.File[] | undefined;
        const file = files?.[0] || req.file as Express.MulterS3.File | undefined;

        if (!file) {
            return next(new ErrorHandler("No file uploaded", 400));
        }

        const user = await UserModel.findById(currentUserId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        user.avatar = file.location;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    })
]

// Update user role by admin
type TUpdateRoleReq = {
    userId: string;
    role: number;
}
export const updateUserRoleByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user._id.toString();
        const { userId, role } = req.body as TUpdateRoleReq;

        if (!userId || typeof role !== "number") {
            return next(new ErrorHandler("UserId and role are required", 400));
        }

        if (currentUserId === userId) {
            return next(new ErrorHandler("You can't change your role", 400));
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        user.role = role;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Update user password by admin
type TUpdatePwdByAdminReq = {
    userId: string;
    newPassword: string;
}
export const updateUserPwdByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user._id.toString();
        const { userId, newPassword } = req.body as TUpdatePwdByAdminReq;

        if (!userId || !newPassword) {
            return next(new ErrorHandler("UserId and password are required", 400));
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (currentUserId === userId) {
            return next(new ErrorHandler("Use the profile page to change your own password", 400));
        }

        user.password = newPassword;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Delete user by admin
export const deleteUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        if (req.user._id.toString() === id) {
            return next(new ErrorHandler("You can't delete your own account", 400));
        }

        const user = await UserModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User is deleted successfully!",
        })
    }
);
