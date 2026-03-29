const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

async function test(modelName) {
  try {
    console.log(`Testing ${modelName} on v1beta...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    await model.generateContent("test");
    console.log(`Success with ${modelName} on v1beta`);
  } catch (e) {
    console.log(`Failed with ${modelName} on v1beta: [${e.status}] ${e.message}`);
  }
}

async function run() {
  await test("gemini-1.5-flash");
  await test("gemini-2.5-flash");
}

run();
