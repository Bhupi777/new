require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const twilioWebhook = require("./twilioWebhook");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/twilio/voice", twilioWebhook);

app.get("/", (req, res) => {
  res.send("ME CABS Voice Agent is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});