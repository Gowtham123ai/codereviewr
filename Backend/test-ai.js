const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testAI() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "You are a helpful assistant."
    });

    try {
        console.log("Sending request to Gemini...");
        const result = await model.generateContent("Hello, are you working?");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Test AI Error:", error);
    }
}

testAI();
