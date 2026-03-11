import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import {
    createContactMessage,
    getAllContactMessages,
    markAsRead,
    deleteContactMessage,
} from "../controllers/contact.controller";

const contactRouter = express.Router();

// PUBLIC — Anyone can submit a contact form
contactRouter.post('/', createContactMessage);

// ADMIN ONLY — View, mark as read, delete messages
contactRouter.get('/', isAuthenticated, authorizeRoles([1, 2, 3]), getAllContactMessages);
contactRouter.patch('/:id/read', isAuthenticated, authorizeRoles([1, 2, 3]), markAsRead);
contactRouter.delete('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), deleteContactMessage);

export default contactRouter;
