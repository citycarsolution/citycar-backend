// backend/src/models/Driver.js
import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  carModel: { type: String, default: "" },
  available: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Driver", DriverSchema);
