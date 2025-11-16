export const formatBookingMessage = (b) => `
🚕 *New Booking Received*
———————————————
👤 Customer: ${b.firstName} ${b.lastName}
📞 Phone: ${b.phone}
📍 Pickup: ${b.pickup}
🏁 Drop: ${b.drop}
📅 Date: ${b.date} at ${b.time}
🚗 Car: ${b.carTitle}
💳 Payment: ${b.payment}
———————————————
CityCar Solution
`;
