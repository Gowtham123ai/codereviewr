const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || "");
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

async function generateAnalysis(code, type) {
    const prompt = type === "explain"
        ? `Explain this code in simple terms:\n\n${code}`
        : `Find potential bugs and issues in this code. Provide a concise list: \n\n${code}`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error(`[Tool Service] Error:`, error.message);
        throw new Error(`Tool Gateway Error: ${error.message}`);
    }
}

module.exports = generateAnalysis;
