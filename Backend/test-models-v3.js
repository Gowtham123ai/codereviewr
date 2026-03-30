const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

async function test(modelName) {
  try {
    console.log(`Testing ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("test");
    console.log(`Success with ${modelName}`);
    return true;
  } catch (e) {
    console.log(`Failed with ${modelName}: [${e.status}] ${e.message}`);
    return false;
  }
}

async function run() {
  const models = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp"
  ];
  for (const model of models) {
    await test(model);
  }
}

run();
