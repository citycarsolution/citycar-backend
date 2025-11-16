// backend/src/controllers/adminController.js
import Booking from "../models/Booking.js";
import Driver from "../models/Driver.js";
import User from "../models/User.js";
import { sendBookingNotificationToDriver, sendBookingNotificationToUser } from "../services/notifications.js";
import { generateInvoicePdfBuffer } from "../services/pdfServices.js";

export const getBookings = async (req, res, next) => {
  try {
    const q = req.query || {};
    // simple filter examples: status, service
    const filter = {};
    if (q.status) filter.status = q.status;
    if (q.service) filter.service = q.service;

    const bookings = await Booking.find(filter).populate("pickup drop airport driver user");
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const b = await Booking.findById(req.params.id).populate("pickup drop airport driver user");
    if (!b) return res.status(404).json({ message: "Booking not found" });
    res.json({ data: b });
  } catch (err) {
    next(err);
  }
};

export const assignDriver = async (req, res, next) => {
  try {
    const { bookingId, driverId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    booking.driver = driver._id;
    booking.status = "assigned";
    await booking.save();

    // notify driver + user
    await sendBookingNotificationToDriver(driver, booking);
    await sendBookingNotificationToUser(booking.user || booking.contactInfo, booking, { notifyType: "assigned" });

    res.json({ message: "Driver assigned", booking });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    // Notify user & driver
    if (booking.driver) {
      const driver = await Driver.findById(booking.driver);
      if (driver) await sendBookingNotificationToDriver(driver, booking, { type: "cancel" });
    }
    await sendBookingNotificationToUser(booking.user || booking.contactInfo, booking, { notifyType: "cancelled" });

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    next(err);
  }
};

export const getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().populate("vehicle");
    res.json({ data: drivers });
  } catch (err) {
    next(err);
  }
};

export const createDriver = async (req, res, next) => {
  try {
    const payload = req.body;
    const driver = await Driver.create(payload);
    res.status(201).json({ message: "Driver created", driver });
  } catch (err) {
    next(err);
  }
};
