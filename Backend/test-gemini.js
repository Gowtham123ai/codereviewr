const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Write a hello world program in Python.");
    console.log("Full Result:", JSON.stringify(result, null, 2));
    const response = await result.response;
    const text = response.text();
    console.log("Text:", text);
  } catch (error) {
    console.error("Error Detail:", error);
  }
}

run();
