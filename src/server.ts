import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/error";
import connectDB from "./config/db";
import rateLimit from "express-rate-limit";

import userRouter from "./routes/user.route";
import categoryRouter from "./routes/category.route";
import newsRouter from "./routes/news.route";
import commentRouter from "./routes/comment.route";
import pageRouter from "./routes/page.route";
import contactRouter from "./routes/contact.route";
import announcementRouter from "./routes/announcement.route";
import districtRouter from "./routes/district.route";
import aboutRouter from "./routes/about.route";
import twonshipRouter from "./routes/twonship.route";
import reportRouter from "./routes/report.route";

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
];

const configuredOrigins = (process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // app.use(cors()) already handles OPTIONS preflight — no need for app.options("*", ...)
    // which would crash Express 5 (bare * wildcard is not valid in path-to-regexp v8+)
}));
app.use(limiter);

const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || "";

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("<h1>News Portal Backend is working...</h1>");
});

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        port,
        allowedOrigins,
    });
});

app.use('/users', userRouter);
app.use('/categories', categoryRouter);
app.use('/news', newsRouter);
app.use('/comments', commentRouter);
app.use('/pages', pageRouter);
app.use('/contacts', contactRouter);
app.use('/announcements', announcementRouter);
app.use('/districts', districtRouter);
app.use('/townships', twonshipRouter);
app.use('/about', aboutRouter);
app.use('/reports', reportRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} is not found!`,
    })
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectDB(dbUrl);
});

app.use(ErrorMiddleware);
