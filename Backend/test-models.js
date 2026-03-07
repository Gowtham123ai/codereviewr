const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
    try {
        // The SDK doesn't have a direct listModels, we usually use the REST API or check docs.
        // But we can try a few common ones.
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("test");
                console.log(`✅ ${m} is available`);
            } catch (e) {
                console.log(`❌ ${m} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
