import express from "express";
import {
  createTwonship,
  deleteTwonship,
  getAllTwonships,
  getTwonshipById,
  updateTwonship,
} from "../controllers/twonship.controller";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { uploadS3 } from "../middlewares/upload";

const twonshipRouter = express.Router();

twonshipRouter.post("/", isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.single("coverImage"), createTwonship);
twonshipRouter.get("/", getAllTwonships);
twonshipRouter.get("/:id", getTwonshipById);
twonshipRouter.patch("/:id", isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.single("coverImage"), updateTwonship);
twonshipRouter.delete("/:id", isAuthenticated, authorizeRoles([1, 2, 3]), deleteTwonship);

export default twonshipRouter;
