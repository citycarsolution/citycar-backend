// backend/src/utils/notifications.js
import { sendBookingConfirmationEmail, sendEmail } from "../services/emailService.js";
import { sendWhatsApp } from "../services/whatsaapServices.js";
import { generateInvoicePdfBuffer } from "../services/pdfServices.js";

/**
 * sendBookingNotificationToUser(userData, booking, options)
 * userData can be user model or plain object with { email, phone, name }
 */
export async function sendBookingNotificationToUser(userData, booking, options = {}) {
  try {
    const email = userData?.email || userData?.contactEmail;
    const phone = userData?.phone || userData?.mobile || userData?.contactNumber;
    const message = `Your booking ${booking._id} is ${booking.status || "confirmed"}. Pickup: ${booking.pickup?.label || ""} on ${booking.pickupDate} ${booking.pickupTime}`;

    // generate invoice PDF
    const pdf = await generateInvoicePdfBuffer(booking);

    if (email) {
      await sendBookingConfirmationEmail(email, booking, pdf);
    }
    if (phone) {
      await sendWhatsApp(phone, message /*, optionally media */);
    }
  } catch (err) {
    console.error("sendBookingNotificationToUser error:", err);
  }
}

/**
 * sendBookingNotificationToDriver(driverDoc, booking, opts)
 */
export async function sendBookingNotificationToDriver(driverDoc, booking, opts = {}) {
  try {
    const message = `New booking assigned: ${booking._id}. Pickup ${booking.pickup?.label || ""} at ${booking.pickupDate} ${booking.pickupTime}. Contact: ${booking.contactNumber || booking.userContact}`;
    if (driverDoc?.phone) {
      await sendWhatsApp(driverDoc.phone, message);
    }
    if (driverDoc?.email) {
      await sendEmail(driverDoc.email, `New Booking Assigned ${booking._id}`, `<p>${message}</p>`);
    }
  } catch (err) {
    console.error("notify driver error:", err);
  }
}
