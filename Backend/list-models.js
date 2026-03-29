const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

async function listModels() {
  try {
    const list = await genAI.listModels();
    for (const model of list.models) {
      console.log(model.name);
    }
  } catch (error) {
    console.error("Listing models failed:", error);
  }
}

listModels();
