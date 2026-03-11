import express from "express";
import { deleteUser, getAllUsers, getCurrentUserInfo, getUserById, login, register, updateUserInfo, updateUserPassword, updateUserPwdByAdmin, updateUserRoleByAdmin, uploadUserAvatar } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();

// Public routes
userRouter.post('/register', register);
userRouter.post('/login', login);

// Authenticated routes
userRouter.get('/me', isAuthenticated, getCurrentUserInfo);
userRouter.get('/:id', isAuthenticated, getUserById);
userRouter.get('/', isAuthenticated, getAllUsers);
userRouter.patch('/', isAuthenticated, updateUserInfo);
userRouter.patch('/update-pwd', isAuthenticated, updateUserPassword);
userRouter.patch('/update-avatar', isAuthenticated, uploadUserAvatar);

// Admin routes
userRouter.patch('/update-role', isAuthenticated, authorizeRoles([2, 3]), updateUserRoleByAdmin);
userRouter.patch('/update-pwd-admin', isAuthenticated, authorizeRoles([2, 3]), updateUserPwdByAdmin);
userRouter.delete('/:id', isAuthenticated, authorizeRoles([2, 3]), deleteUser);

export default userRouter;
