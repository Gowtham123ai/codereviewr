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
  await test("gemini-1.5-flash-001");
  await test("gemini-1.5-flash-002");
  await test("gemini-1.5-flash-latest");
}

run();
