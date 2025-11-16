import PDFDocument from "pdfkit";
import getStream from "get-stream";

export async function generateInvoicePdf(booking) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.fontSize(20).text("City Car Solution — Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Booking ID: ${booking._id}`);
  doc.text(`Name: ${booking.name}`);
  doc.text(`Phone: ${booking.phone}`);
  doc.text(`Service: ${booking.service}`);
  doc.text(`Pickup: ${booking.pickup}`);
  doc.text(`Drop: ${booking.drop}`);
  doc.text(`Date/Time: ${booking.date} ${booking.time}`);
  doc.text(`Car: ${booking.carTitle}`);
  doc.text(`Payment: ${booking.payment}`);
  doc.moveDown();
  doc.text("Thank you for choosing City Car Solution.", { align: "center" });
  doc.end();
  const buffer = await getStream.buffer(doc);
  return buffer;
}
