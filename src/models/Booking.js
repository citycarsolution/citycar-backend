// backend/src/models/Booking.js
import mongoose from "mongoose";

const FareBreakdownSchema = new mongoose.Schema({
  base: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  tolls: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },

  // customer
  customerName: { type: String, required: true, default: "Guest" },
  customerPhone: { type: String, required: true, default: "" },
  customerEmail: { type: String, default: "" },

  // route / service
  pickup: { type: String, default: "" },
  drop: { type: String, default: "" },
  date: { type: String, default: "" },
  time: { type: String, default: "" },

  serviceType: { type: String, enum: ["local","outstation","airport","other"], default: "local" },
  serviceLabel: { type: String, default: "" },

  carTitle: { type: String, default: "" },

  // driver info
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  driverName: { type: String, default: "" },
  driverPhone: { type: String, default: "" },
  driverCar: { type: String, default: "" },

  // fare & payment
  fare: { type: FareBreakdownSchema, default: () => ({}) },
  paymentMethod: { type: String, enum: ["Cash","UPI","Online","Wallet","Other","Price"], default: "Cash" },
  paymentStatus: { type: String, enum: ["Paid","Unpaid","Pending","Refunded"], default: "Unpaid" },

  status: { type: String, enum: ["Pending","Assigned","Ongoing","Completed","Cancelled"], default: "Pending" },

  // cancel / history
  cancelReason: { type: String, default: "" },
  cancelledBy: { type: String, default: "" },
  cancelledAt: { type: Date },
  notes: { type: String, default: "" },
  history: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema);
