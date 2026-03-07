const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
    const models = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${m} worked! Response length: ${result.response.text().length}`);
            break; // Stop if we find one that works
        } catch (e) {
            console.log(`❌ ${m} failed: ${e.message}`);
        }
    }
}

testModels();
