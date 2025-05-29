const openai = require("openai");

const configuration = new openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = new openai.OpenAIApi(configuration);

async function processConversation(prompt) {
  const response = await openaiClient.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  return response.data.choices[0].message.content;
}

module.exports = { processConversation };
