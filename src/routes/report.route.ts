import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { getReportsSummary } from "../controllers/report.controller";

const reportRouter = express.Router();

reportRouter.get("/summary", isAuthenticated, authorizeRoles([1, 2, 3]), getReportsSummary);

export default reportRouter;
