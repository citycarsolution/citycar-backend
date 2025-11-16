// backend/src/routes/adminRoutes.js
import express from "express";
import {
  getBookings,
  getBookingById,
  assignDriver,
  cancelBooking,
  getDrivers,
  createDriver,
} from "../controllers/adminController.js";
import { protect, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// all routes protected and require admin role
router.use(protect, requireRole("admin"));

router.get("/bookings", getBookings);
router.get("/bookings/:id", getBookingById);
router.post("/bookings/assign", assignDriver);
router.post("/bookings/:id/cancel", cancelBooking);

router.get("/drivers", getDrivers);
router.post("/drivers", createDriver);

export default router;
