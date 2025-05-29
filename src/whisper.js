const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function transcribeAudio(audioUrl) {
  try {
    const audioRes = await axios({ url: audioUrl + ".mp3", method: "GET", responseType: "arraybuffer" });
    const formData = new FormData();
    formData.append("file", Buffer.from(audioRes.data), "audio.mp3");
    formData.append("model", "whisper-1");

    const res = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    return res.data.text;
  } catch (err) {
    console.error("Transcription error:", err.message);
    return "";
  }
}

module.exports = { transcribeAudio };