import { Schema, model, Document } from "mongoose";

export interface IDistrict extends Document {
  name: string;
  address: string;
  phone: string;
  mapUrl?: string;
  coverImage: string;
  township?: string;
  population?: string;
  budget?: string;
  createdAt: Date;
  updatedAt: Date;
}

const districtSchema = new Schema<IDistrict>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    mapUrl: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      required: true,
    },
    population: {
      type: String,
      default: "",
      trim: true,
    },
    budget: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const DistrictModel = model<IDistrict>("District", districtSchema);
export default DistrictModel;
