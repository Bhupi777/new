const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendBookingSMS(booking) {
  const message = `ME CABS Booking: ${booking.pickup} to ${booking.dropoff} at ${booking.time}. Fare: $${booking.fare}.`;
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.ALERT_MOBILE_NUMBER,
  });
}

module.exports = { sendBookingSMS };