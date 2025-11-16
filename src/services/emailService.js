// backend/src/services/emailService.js
import nodemailer from "nodemailer";
export async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to, subject, html
    });
    return info;
  } catch (err) {
    console.error("sendEmail err", err);
    throw err;
  }
}
