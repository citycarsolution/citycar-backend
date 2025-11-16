import nodemailer from "nodemailer";
import twilio from "twilio";

export async function sendBookingNotifications(booking) {
  try {
    // Email to admin
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    const html = `<h3>New Booking</h3>
      <p>${booking.firstName || booking.name} • ${booking.phone}</p>
      <pre>${JSON.stringify(booking, null, 2)}</pre>`;

    if (adminEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: adminEmail,
        subject: "New CityCar Booking Received",
        html,
      });
    }

    // WhatsApp via Twilio
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      const to = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. whatsapp:+91...
      if (to) {
        const body = `🆕 New Booking\nCustomer: ${booking.firstName || booking.name}\nPhone: ${booking.phone}\nService: ${booking.serviceLabel || booking.service}`;
        await client.messages.create({ from: process.env.TWILIO_WHATSAPP_FROM, to, body });
      }
    }
  } catch (err) {
    console.error("Notification error:", err);
  }
}

export default { sendBookingNotifications };
