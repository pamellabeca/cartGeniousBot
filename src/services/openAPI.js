require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function callOpenAI(prompt, callback) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured!");
    return callback("others");
  }

  openai.chat.completions
    .create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })
    .then((response) => {
      const resposta = response.choices[0].message.content.trim().toLowerCase();
      callback(resposta);
    })
    .catch((error) => {
      console.error("Requisition Error:", error);
      callback("others");
    });
}

module.exports = { callOpenAI };