import { NextFunction, Request, Response } from "express";
import NewsModel from "../models/news.model";
import ErrorHandler from "../utils/ErrorHandler";

type PeriodSummary = {
    key: string;
    label: string;
    total: number;
    news: number;
    activities: number;
    published: number;
    drafts: number;
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const buildSummaryPipeline = (groupId: Record<string, unknown>, match: Record<string, unknown> = {}, sort: Record<string, 1 | -1>) => [
    { $match: match },
    {
        $group: {
            _id: groupId,
            total: { $sum: 1 },
            news: {
                $sum: {
                    $cond: [{ $ne: ["$category", "Activities"] }, 1, 0],
                },
            },
            activities: {
                $sum: {
                    $cond: [{ $eq: ["$category", "Activities"] }, 1, 0],
                },
            },
            published: {
                $sum: {
                    $cond: [{ $eq: ["$status", "Published"] }, 1, 0],
                },
            },
            drafts: {
                $sum: {
                    $cond: [{ $eq: ["$status", "Draft"] }, 1, 0],
                },
            },
        },
    },
    { $sort: sort },
];

const mapDailySummary = (rows: Array<{ _id: { year: number; month: number; day: number } } & Omit<PeriodSummary, "key" | "label">>): PeriodSummary[] =>
    rows.map((row) => ({
        key: `${row._id.year}-${String(row._id.month).padStart(2, "0")}-${String(row._id.day).padStart(2, "0")}`,
        label: `${String(row._id.day).padStart(2, "0")} ${monthLabels[row._id.month - 1]}`,
        total: row.total,
        news: row.news,
        activities: row.activities,
        published: row.published,
        drafts: row.drafts,
    }));

const mapMonthlySummary = (rows: Array<{ _id: { year: number; month: number } } & Omit<PeriodSummary, "key" | "label">>): PeriodSummary[] =>
    rows.map((row) => ({
        key: `${row._id.year}-${String(row._id.month).padStart(2, "0")}`,
        label: `${monthLabels[row._id.month - 1]} ${row._id.year}`,
        total: row.total,
        news: row.news,
        activities: row.activities,
        published: row.published,
        drafts: row.drafts,
    }));

const mapYearlySummary = (rows: Array<{ _id: { year: number } } & Omit<PeriodSummary, "key" | "label">>): PeriodSummary[] =>
    rows.map((row) => ({
        key: String(row._id.year),
        label: String(row._id.year),
        total: row.total,
        news: row.news,
        activities: row.activities,
        published: row.published,
        drafts: row.drafts,
    }));

export const getReportsSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthStart = new Date(currentYear, currentMonth, 1);
        const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
        const yearStart = new Date(currentYear, 0, 1);
        const nextYearStart = new Date(currentYear + 1, 0, 1);

        const [overviewRows, dailyRows, monthlyRows, yearlyRows] = await Promise.all([
            NewsModel.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        news: {
                            $sum: {
                                $cond: [{ $ne: ["$category", "Activities"] }, 1, 0],
                            },
                        },
                        activities: {
                            $sum: {
                                $cond: [{ $eq: ["$category", "Activities"] }, 1, 0],
                            },
                        },
                        published: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Published"] }, 1, 0],
                            },
                        },
                        drafts: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Draft"] }, 1, 0],
                            },
                        },
                    },
                },
            ]),
            NewsModel.aggregate(
                buildSummaryPipeline(
                    {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    {
                        createdAt: {
                            $gte: monthStart,
                            $lt: nextMonthStart,
                        },
                    },
                    { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
                )
            ),
            NewsModel.aggregate(
                buildSummaryPipeline(
                    {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    {
                        createdAt: {
                            $gte: yearStart,
                            $lt: nextYearStart,
                        },
                    },
                    { "_id.year": 1, "_id.month": 1 }
                )
            ),
            NewsModel.aggregate(
                buildSummaryPipeline(
                    {
                        year: { $year: "$createdAt" },
                    },
                    {},
                    { "_id.year": 1 }
                )
            ),
        ]);

        const overview = overviewRows[0] || {
            total: 0,
            news: 0,
            activities: 0,
            published: 0,
            drafts: 0,
        };

        res.status(200).json({
            success: true,
            overview,
            meta: {
                currentYear,
                currentMonth: currentMonth + 1,
            },
            daily: mapDailySummary(dailyRows),
            monthly: mapMonthlySummary(monthlyRows),
            yearly: mapYearlySummary(yearlyRows),
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch reports summary", 500));
    }
};
