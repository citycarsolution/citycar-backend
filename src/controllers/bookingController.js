// backend/src/controllers/bookingController.js

import Booking from "../models/Booking.js";
import Driver from "../models/Driver.js";
import Car from "../models/Car.js";
import User from "../models/User.js";

/* ---------------- helpers ---------------- */
const PAYMENT_MAP = { cash: "Cash", upi: "UPI", online: "Online", wallet: "Wallet", other: "Other" };
function normalizePaymentMethod(raw) {
  if (!raw) return "Cash";
  const key = String(raw).trim().toLowerCase();
  return PAYMENT_MAP[key] || "Cash";
}

function createWhatsAppLink(phone, message) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

async function pushHistoryEntry(bookingId, entry) {
  try {
    const b = await Booking.findById(bookingId);
    const hist = Array.isArray(b?.history) ? b.history : [];
    hist.push(entry);
    await Booking.findByIdAndUpdate(bookingId, { history: hist }, { new: true });
  } catch (e) {
    console.error("pushHistoryEntry error:", e);
  }
}

function parseNumber(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  let s = String(v).replace(/[,₹\s]/g, "");
  s = s.replace(/[^0-9.\-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/* ------------------- CONTROLLERS ------------------- */

// CREATE - SIMPLIFIED AND FIXED
export const createBooking = async (req, res) => {
  try {
    const p = req.body || {};
    
    console.log("CREATE_BOOKING_PAYLOAD:", JSON.stringify(p, null, 2));

    // SIMPLIFIED FARE HANDLING - DIRECT APPROACH
    let fareTotal = 0;
    
    // Try to get fare from various possible fields
    const possibleFareFields = [
      p.fare?.total,
      p.total,
      p.fareTotal, 
      p.fare_total,
      p.price,
      p.amount,
      p.estimatedFare,
      p.selectedCar?.fare?.total
    ];
    
    for (const field of possibleFareFields) {
      if (field != null) {
        const parsed = parseNumber(field);
        if (parsed > 0) {
          fareTotal = parsed;
          console.log(`Found fare from field: ${parsed}`);
          break;
        }
      }
    }

    // If still no fare, use service-based defaults
    if (fareTotal === 0) {
      const svc = String(p.serviceLabel || p.serviceType || "").toLowerCase();
      if (svc.includes("airport")) fareTotal = 1000;
      else if (svc.includes("outstation")) fareTotal = 2000;
      else if (svc.includes("local")) fareTotal = 800;
      console.log(`Using service-based fare: ${fareTotal}`);
    }

    const fare = {
      base: parseNumber(p.fare?.base || p.base || fareTotal),
      extras: parseNumber(p.fare?.extras || p.extras || 0),
      tolls: parseNumber(p.fare?.tolls || p.tolls || 0),
      discount: parseNumber(p.fare?.discount || p.discount || 0),
      total: fareTotal
    };

    const booking = await Booking.create({
      bookingId: p.bookingId || `BK${Date.now()}`,
      customerName: p.customerName || p.name || "Guest",
      customerPhone: p.customerPhone || p.phone || p.mobile || "",
      customerEmail: p.customerEmail || p.email || "",
      serviceType: p.serviceType || "local",
      serviceLabel: p.serviceLabel || p.service || "",
      pickup: p.pickup || "",
      drop: p.drop || "",
      date: p.date || "",
      time: p.time || "",
      carTitle: p.carTitle || p.car || (p.selectedCar?.carTitle || p.selectedCar?.carId || ""),
      fare: fare,
      paymentMethod: normalizePaymentMethod(p.paymentMethod || p.payment || undefined),
      paymentStatus: p.paymentStatus || "Unpaid",
      status: p.status || "Pending",
      notes: p.notes || ""
    });

    await pushHistoryEntry(booking._id, { evt: "Created", at: new Date(), by: "System" });

    console.log(`✅ BOOKING CREATED: ${booking.bookingId} with fare: ${booking.fare.total}`);

    return res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// LIST - SIMPLIFIED AND FIXED
export const listBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).populate({ path: "driverId", select: "name phone carModel" }).lean();
    
    const out = bookings.map(b => {
      const fare = b.fare || {};
      
      // SIMPLE AND RELIABLE APPROACH
      let total = 0;
      
      // Just use whatever is in fare.total, if it exists
      if (fare.total != null) {
        total = parseNumber(fare.total);
      }
      
      // If still zero, try to compute from breakdown
      if (total === 0 && (fare.base || fare.extras || fare.tolls || fare.discount)) {
        total = parseNumber(fare.base || 0) + 
                parseNumber(fare.extras || 0) + 
                parseNumber(fare.tolls || 0) - 
                parseNumber(fare.discount || 0);
      }
      
      // If still zero, use any top-level total field
      if (total === 0 && b.total != null) {
        total = parseNumber(b.total);
      }

      return {
        ...b,
        fare: {
          base: parseNumber(fare.base || 0),
          extras: parseNumber(fare.extras || 0),
          tolls: parseNumber(fare.tolls || 0),
          discount: parseNumber(fare.discount || 0),
          total: total
        },
        driverName: b.driverId ? b.driverId.name : b.driverName || "",
        driverPhone: b.driverId ? b.driverId.phone : b.driverPhone || "",
        driverCar: b.driverId ? b.driverId.carModel : b.driverCar || "",
        total: total // Add top-level total for easy frontend access
      };
    });
    
    return res.json(out);
  } catch (err) {
    console.error("listBookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ASSIGN DRIVER
export const assignDriver = async (req, res) => {
  try {
    const id = req.params.id;
    const { driverId } = req.body;
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const booking = await Booking.findByIdAndUpdate(id, { 
      driverId, 
      driverName: driver.name, 
      driverPhone: driver.phone, 
      driverCar: driver.carModel || "", 
      status: "Assigned" 
    }, { new: true });
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await pushHistoryEntry(id, { evt: "Assigned", at: new Date(), by: "Admin", driver: driver.name });

    const msgDriver = `नया असाइनमेंट — CityCar
Booking ID: ${booking.bookingId}
Pickup: ${booking.pickup} • ${booking.date || ""} ${booking.time || ""}
Drop: ${booking.drop}
Customer: ${booking.customerName || "Guest"} (${booking.customerPhone || "—"})
Fare (est): ₹${booking.fare?.total ?? "—"}
कृपया स्वीकार/अस्वीकार करें।`;
    const waDriver = createWhatsAppLink(driver.phone, msgDriver);

    const msgCustomer = `नमस्ते ${booking.customerName || ""},
आपकी बुकिंग ${booking.bookingId} को ड्राइवर असाइन कर दिया गया है:
ड्राइवर: ${driver.name} • ${driver.phone}
कार: ${driver.carModel || booking.driverCar || "—"}
कुल राशि: ₹${booking.fare?.total ?? "—"}
धन्यवाद — CityCar`;
    const waCustomer = createWhatsAppLink(booking.customerPhone, msgCustomer);

    return res.json({ success: true, booking, waDriver, waCustomer });
  } catch (err) {
    console.error("assignDriver error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// COMPLETE + SEND BILL
export const completeBookingAndSendBill = async (req, res) => {
  try {
    const id = req.params.id;
    const { fare: incomingFare, paymentMethod: rawPayment } = req.body || {};
    const paymentMethod = normalizePaymentMethod(rawPayment || undefined);
    const prev = await Booking.findById(id);
    if (!prev) return res.status(404).json({ message: "Booking not found" });

    const fare = {
      base: parseNumber(incomingFare?.base ?? prev.fare?.base ?? 0),
      extras: parseNumber(incomingFare?.extras ?? prev.fare?.extras ?? 0),
      tolls: parseNumber(incomingFare?.tolls ?? prev.fare?.tolls ?? 0),
      discount: parseNumber(incomingFare?.discount ?? prev.fare?.discount ?? 0),
      total: parseNumber(incomingFare?.total ?? prev.fare?.total ?? 0)
    };
    if (!fare.total) fare.total = fare.base + fare.extras + fare.tolls - fare.discount;

    const booking = await Booking.findByIdAndUpdate(id, { fare, status: "Completed", paymentStatus: "Paid", paymentMethod }, { new: true });
    await pushHistoryEntry(id, { evt: "Completed", at: new Date(), by: "Admin" });

    const msg = `नमस्ते ${booking.customerName || ""},
आपकी यात्रा पूरी हुई — आपकी Final Bill:
Booking ID: ${booking.bookingId}
कुल राशि: ₹${booking.fare?.total ?? "—"}
Driver: ${booking.driverName || "—"} • ${booking.driverPhone || "—"}
धन्यवाद — CityCar`;
    const waLink = createWhatsAppLink(booking.customerPhone, msg);

    return res.json({ success: true, booking, waLink });
  } catch (err) {
    console.error("completeBookingAndSendBill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CANCEL
export const cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const { reason, cancelledBy } = req.body || {};
    const prev = await Booking.findById(id);
    if (!prev) return res.status(404).json({ message: "Booking not found" });

    const booking = await Booking.findByIdAndUpdate(id, { 
      status: "Cancelled", 
      cancelReason: reason || "Not specified", 
      cancelledBy: cancelledBy || "Admin", 
      cancelledAt: new Date() 
    }, { new: true });
    
    await pushHistoryEntry(id, { evt: "Cancelled", at: new Date(), by: cancelledBy || "Admin", reason });

    const msgCustomer = `नमस्ते ${booking.customerName || ""},
आपकी बुकिंग ${booking.bookingId} को रद्द कर दिया गया है।
Reason: ${reason || "—"}
Cancelled by: ${cancelledBy || "Admin"}
धन्यवाद — CityCar`;
    const waCustomer = createWhatsAppLink(booking.customerPhone, msgCustomer);

    let waDriver = null;
    if (prev?.driverPhone) {
      const msgDriver = `Booking Cancelled — CityCar
Booking ID: ${booking.bookingId}
Customer: ${booking.customerName || "—"} • ${booking.customerPhone || "—"}
Reason: ${reason || "—"}
Cancelled by: ${cancelledBy || "Admin"}`;
      waDriver = createWhatsAppLink(prev.driverPhone, msgDriver);
    }

    return res.json({ success: true, booking, waCustomer, waDriver });
  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DRIVER CANCEL
export const driverCancel = async (req, res) => {
  try {
    const id = req.params.id;
    const { driverId, reason } = req.body || {};
    const driver = await Driver.findById(driverId).lean().exec();
    const prev = await Booking.findById(id);
    if (!prev) return res.status(404).json({ message: "Booking not found" });

    const booking = await Booking.findByIdAndUpdate(id, { 
      status: "Pending", 
      driverId: null, 
      driverName: null, 
      driverPhone: null, 
      cancelReason: reason || "Driver cancelled", 
      cancelledBy: `Driver:${driver?._id || driverId}`, 
      cancelledAt: new Date() 
    }, { new: true });
    
    await pushHistoryEntry(id, { evt: "DriverCancelled", at: new Date(), by: driver?.name || `Driver:${driverId}`, reason });

    const waCustomer = createWhatsAppLink(booking.customerPhone, `नमस्ते ${booking.customerName || ""},\nड्राइवर ने आपकी बुकिंग ${booking.bookingId} रद्द कर दी है। हम नया ड्राइवर भेज रहे हैं।`);
    return res.json({ success: true, booking, waCustomer, driver });
  } catch (err) {
    console.error("driverCancel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DASHBOARD STATS
export const dashboardStats = async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    let totalCustomers = 0;
    try { 
      totalCustomers = await User.countDocuments(); 
    } catch { 
      const phones = await Booking.distinct("customerPhone"); 
      totalCustomers = phones.length; 
    }
    const activeBookings = await Booking.countDocuments({ status: { $in: ["Pending","Assigned","Ongoing"] } });
    const start = new Date(); 
    start.setHours(0,0,0,0); 
    const end = new Date(); 
    end.setHours(23,59,59,999);
    const rev = await Booking.aggregate([
      { 
        $match: { 
          status: "Completed", 
          updatedAt: { $gte: start, $lte: end } 
        } 
      }, 
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $ifNull: ["$fare.total", 0] } } 
        } 
      }
    ]);
    const todaysRevenue = rev[0]?.total || 0;
    
    return res.json({ totalCars, totalCustomers, activeBookings, todaysRevenue });
  } catch (err) {
    console.error("dashboardStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};