import { model, Schema } from "mongoose";
import { IUser } from "../types/IUser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "Please enter a valid email",
        }
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    avatar: {
        type: String,
    },
    role: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
});

userSchema.methods.signAccessToken = async function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
}

userSchema.methods.comparePassword = async function (enterPassword: string) {
    return await bcrypt.compare(enterPassword, this.password);
}

const UserModel = model<IUser>("users", userSchema);
export default UserModel;