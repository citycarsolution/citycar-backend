// backend/src/routes/bookingRoutes.js
import express from "express";
import {
  listBookings,
  createBooking,
  assignDriver,
  completeBookingAndSendBill,
  cancelBooking,
  driverCancel,
  dashboardStats
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", listBookings);
router.post("/", createBooking);

router.get("/stats", dashboardStats);

router.put("/:id/assign-driver", assignDriver);
router.put("/:id/complete", completeBookingAndSendBill);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/driver-cancel", driverCancel);

export default router;
