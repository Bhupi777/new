const express = require("express");
const router = express.Router();
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const { transcribeAudio } = require("./whisper");
const { calculateFare } = require("./greyFollowUp");
const { saveBooking } = require("./booking");
const { sendBookingSMS } = require("./notify");
const { processConversation } = require("./conversation");

router.post("/", async (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const recordingUrl = req.body.RecordingUrl || "";
  const step = req.query.step || req.body.step || "start";

  let context = {};

  if (!recordingUrl && step === "start") {
    twiml.say("Hello, ME CABS. How may I help you?");
    twiml.record({
      action: "/twilio/voice?step=pickup",
      method: "POST",
      maxLength: 10,
      playBeep: true,
      trim: "trim-silence"
    });
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  if (step === "pickup" && recordingUrl) {
    context.pickup = await transcribeAudio(recordingUrl);
    twiml.say("Thank you. Now tell me your drop off location after the beep.");
    twiml.record({
      action: `/twilio/voice?step=dropoff&pickup=${encodeURIComponent(context.pickup)}`,
      method: "POST",
      maxLength: 10,
      playBeep: true,
      trim: "trim-silence"
    });
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  if (step === "dropoff" && recordingUrl) {
    context.pickup = req.query.pickup;
    context.dropoff = await transcribeAudio(recordingUrl);
    twiml.say("When would you like to be picked up? Say 'now' or tell me a specific time after the beep.");
    twiml.record({
      action: `/twilio/voice?step=time&pickup=${encodeURIComponent(context.pickup)}&dropoff=${encodeURIComponent(context.dropoff)}`,
      method: "POST",
      maxLength: 7,
      playBeep: true,
      trim: "trim-silence"
    });
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  if (step === "time" && recordingUrl) {
    context.pickup = req.query.pickup;
    context.dropoff = req.query.dropoff;
    context.time = await transcribeAudio(recordingUrl);
    const fare = await calculateFare(context.pickup, context.dropoff);

    const aiPrompt = `
Respond with a short, polite confirmation for a taxi booking using these details:

Pickup: ${context.pickup}
Dropoff: ${context.dropoff}
Time: ${context.time}
Fare: $${fare}

Keep the tone professional and aligned with ME CABS brand. End with: Thank you for choosing ME CABS.
    `;

    const aiReply = await processConversation(aiPrompt, context);

    const booking = {
      callSid,
      pickup: context.pickup,
      dropoff: context.dropoff,
      time: context.time,
      fare,
      status: "pending",
    };
    await saveBooking(booking);
    await sendBookingSMS(booking);

    twiml.say({ voice: "Polly.Joanna" }, aiReply);
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  twiml.say("Sorry, I did not get that. Let's try again. ME CABS, how may I help you?");
  twiml.record({
    action: "/twilio/voice?step=pickup",
    method: "POST",
    maxLength: 10,
    playBeep: true,
    trim: "trim-silence"
  });
  res.type("text/xml");
  res.send(twiml.toString());
});

module.exports = router;