import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";
import UserModel from "./src/models/user.model";

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.DB_URL as string);
        console.log("Connected to MongoDB");

        const roles = [
            { name: "Regular User", email: "user@example.com", role: 0 },
            { name: "Staff Member", email: "staff@example.com", role: 1 },
            { name: "Admin User", email: "admin@example.com", role: 2 },
            { name: "Root Admin", email: "root@example.com", role: 3 }
        ];

        for (const r of roles) {
            const user = await UserModel.findOne({ email: r.email });
            if (!user) {
                await UserModel.create({
                    name: r.name,
                    email: r.email,
                    password: "password123", // Will be hashed by pre-save hook
                    phone: "09123456789",
                    role: r.role,
                    active: true,
                });
                console.log(`Created ${r.name} with email ${r.email} and role ${r.role}`);
            } else {
                user.role = r.role;
                user.password = "password123"; // Will be hashed by pre-save hook
                user.active = true;
                await user.save();
                console.log(`Updated ${r.name} with email ${r.email} and role ${r.role}`);
            }
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedUsers();
