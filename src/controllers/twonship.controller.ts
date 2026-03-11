import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ALLOWED_DISTRICTS, normalizeDistrictName } from "../constants/districts";
import DistrictModel from "../models/district.model";
import TwonshipModel from "../models/township.model";
import ErrorHandler from "../utils/ErrorHandler";

const TWONSHIP_ORDER = new Map<string, number>(
  ALLOWED_DISTRICTS.map((name, index) => [name, index])
);

const normalizeMetric = (value: unknown) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

// Create a twonship
export const createTwonship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, phone, mapUrl, population, budget, districtId } = req.body;

    if (!name || !address || !phone || !districtId) {
      return next(new ErrorHandler("Please provide name, address, district and phone.", 400));
    }

    const district = await DistrictModel.findById(districtId);
    if (!district) {
      return next(new ErrorHandler("District not found.", 404));
    }

    const file = req.file as Express.MulterS3.File | undefined;
    let coverImage = req.body.coverImage;

    if (file) {
      coverImage = file.location;
    }

    if (!coverImage) {
      return next(new ErrorHandler("Cover image is missing.", 400));
    }

    const township = await TwonshipModel.create({
      name,
      address,
      phone,
      mapUrl,
      coverImage,
      population: normalizeMetric(population),
      budget: normalizeMetric(budget),
      district: districtId,
    });

    res.status(201).json({
      success: true,
      township,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to create twonship", 500));
  }
};

// Retrieve all twonships
export const getAllTwonships = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const townships = await TwonshipModel.find().populate("district", "name");

    townships.sort((left, right) => {
      const leftDistrictName =
        typeof left.district === "object" && left.district && "name" in left.district
          ? normalizeDistrictName(String(left.district.name))
          : "";
      const rightDistrictName =
        typeof right.district === "object" && right.district && "name" in right.district
          ? normalizeDistrictName(String(right.district.name))
          : "";
      const leftOrder = TWONSHIP_ORDER.get(leftDistrictName) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = TWONSHIP_ORDER.get(rightDistrictName) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      const nameCompare = left.name.localeCompare(right.name);
      if (nameCompare !== 0) {
        return nameCompare;
      }

      return left.createdAt.getTime() - right.createdAt.getTime();
    });

    res.status(200).json({
      success: true,
      townships,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to fetch twonships", 500));
  }
};

// Retrieve ONE Twonship by Mongo ID or exact twonship name
export const getTwonshipById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawIdentifier = req.params.id;
    const identifier = typeof rawIdentifier === "string" ? rawIdentifier.trim() : "";
    const township = Types.ObjectId.isValid(identifier)
      ? await TwonshipModel.findById(identifier).populate("district", "name")
      : await TwonshipModel.findOne({ name: identifier }).populate("district", "name");

    if (!township) {
      return next(new ErrorHandler("Twonship not found.", 404));
    }

    res.status(200).json({
      success: true,
      township,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to fetch twonship", 400));
  }
};

// Update existing Twonship
export const updateTwonship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body } as Record<string, unknown>;

    if (typeof updateData.name === "string" && !updateData.name.trim()) {
      return next(new ErrorHandler("Township name is required.", 400));
    }

    if (typeof updateData.districtId === "string") {
      const district = await DistrictModel.findById(updateData.districtId);
      if (!district) {
        return next(new ErrorHandler("District not found.", 404));
      }
      updateData.district = updateData.districtId;
      delete updateData.districtId;
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

    const township = await TwonshipModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("district", "name");

    if (!township) {
      return next(new ErrorHandler("Twonship not found.", 404));
    }

    res.status(200).json({
      success: true,
      township,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to update twonship", 500));
  }
};

// Delete Township
export const deleteTwonship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const twonship = await TwonshipModel.findByIdAndDelete(id);

    if (!twonship) {
      return next(new ErrorHandler("Twonship not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Twonship deleted successfully.",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to delete twonship", 500));
  }
};
