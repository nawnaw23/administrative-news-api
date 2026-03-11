import { Schema, model, Document } from "mongoose";

export interface ITownship extends Document {
  district: Schema.Types.ObjectId;
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

const townshipSchema = new Schema<ITownship>(
  {
    district: {
        type: Schema.Types.ObjectId,
        ref: "District",
        required: true,
    },
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

const TownshipModel = model<ITownship>("Township", townshipSchema);
export default TownshipModel;
