import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ALLOWED_DISTRICTS, normalizeDistrictName } from "../constants/districts";
import DistrictModel from "../models/district.model";
import ErrorHandler from "../utils/ErrorHandler";

const DISTRICT_ORDER = new Map<string, number>(
  ALLOWED_DISTRICTS.map((name, index) => [name, index])
);

const normalizeMetric = (value: unknown) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

// Create a District
export const createDistrict = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const normalizedName = normalizeDistrictName(req.body.name);
    const { address, phone, mapUrl, population, budget } = req.body;

    if (!normalizedName || !address || !phone) {
      return next(new ErrorHandler("Please provide name, address, and phone.", 400));
    }

    const file = req.file as Express.MulterS3.File | undefined;
    let coverImage = req.body.coverImage;

    if (file) {
      coverImage = file.location;
    }

    if (!coverImage) {
      return next(new ErrorHandler("Cover image is missing.", 400));
    }

    const district = await DistrictModel.create({
      name: normalizedName,
      address,
      phone,
      mapUrl,
      coverImage,
      population: normalizeMetric(population),
      budget: normalizeMetric(budget),
    });

    res.status(201).json({
      success: true,
      district,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to create district", 500));
  }
};

// Retrieve all Districts
export const getAllDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const districts = await DistrictModel.find();

    districts.sort((left, right) => {
      const leftOrder = DISTRICT_ORDER.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = DISTRICT_ORDER.get(right.name) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.createdAt.getTime() - right.createdAt.getTime();
    });

    res.status(200).json({
      success: true,
      districts,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to fetch districts", 500));
  }
};

// Retrieve ONE District by Mongo ID or exact district name
export const getDistrictById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawIdentifier = req.params.id;
    const identifier = normalizeDistrictName(typeof rawIdentifier === "string" ? rawIdentifier.trim() : "");
    const district = Types.ObjectId.isValid(identifier)
      ? await DistrictModel.findById(identifier)
      : await DistrictModel.findOne({ name: identifier });

    if (!district) {
      return next(new ErrorHandler("District not found.", 404));
    }

    res.status(200).json({
      success: true,
      district,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to fetch district", 400));
  }
};

// Update existing District
export const updateDistrict = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body } as Record<string, unknown>;

    if (typeof updateData.name === "string") {
      updateData.name = normalizeDistrictName(updateData.name);
    }

    if (updateData.population !== undefined) {
      updateData.population = normalizeMetric(updateData.population);
    }

    if (updateData.budget !== undefined) {
      updateData.budget = normalizeMetric(updateData.budget);
    }

    const file = req.file as Express.MulterS3.File | undefined;
    if (file) {
      updateData.coverImage = file.location;
    }

    const district = await DistrictModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!district) {
      return next(new ErrorHandler("District not found.", 404));
    }

    res.status(200).json({
      success: true,
      district,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to update district", 500));
  }
};

// Delete District
export const deleteDistrict = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const district = await DistrictModel.findByIdAndDelete(id);

    if (!district) {
      return next(new ErrorHandler("District not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "District deleted successfully.",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to delete district", 500));
  }
};
