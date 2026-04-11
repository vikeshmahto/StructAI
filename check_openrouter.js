const OpenAI = require("openai");
require("dotenv").config({ path: ".env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function checkOpenRouter() {
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-1.5-flash",
      messages: [{ role: "user", content: "hi" }],
    });
    console.log("✅ OpenRouter is working!");
    console.log("Response:", response.choices[0].message.content);
  } catch (err) {
    console.error("❌ OpenRouter Error:", err.message);
  }
}

checkOpenRouter();
