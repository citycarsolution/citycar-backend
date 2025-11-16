// backend/src/controllers/driverController.js
import Driver from "../models/Driver.js";
import Booking from "../models/Booking.js"; // optional, if you want to reassign bookings

export const listDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 }).lean();
    return res.json(drivers);
  } catch (err) {
    console.error("listDrivers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, phone, carModel } = req.body;
    const driver = await Driver.create({ name, phone, carModel, available: true });
    return res.status(201).json(driver);
  } catch (err) {
    console.error("createDriver error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/drivers/:id
export const deleteDriver = async (req, res) => {
  try {
    const id = req.params.id;
    const driver = await Driver.findById(id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Optional: if driver has assigned active bookings, you may want to prevent deletion or reassign.
    // Example: find active bookings assigned to this driver and unassign them:
    await Booking.updateMany({ driverId: id, status: { $in: ["Assigned","Ongoing"] } }, { $set: { driverId: null, driverName: "", driverPhone: "", status: "Pending" } });

    await Driver.findByIdAndDelete(id);

    return res.json({ success: true, message: "Driver removed" });
  } catch (err) {
    console.error("deleteDriver error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
