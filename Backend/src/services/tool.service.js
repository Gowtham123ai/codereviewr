const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = process.env.GOOGLE_GEMINI_KEY || "";
const genAI = new GoogleGenerativeAI(key);

const MODELS = ["models/gemini-1.5-flash", "models/gemini-1.0-pro", "gemini-pro"];

async function generateAnalysis(code, type) {
    const prompt = type === "explain"
        ? `Explain this code in simple terms:\n\n${code}`
        : `Find potential bugs and issues in this code. Provide a concise list: \n\n${code}`;

    for (const modelName of MODELS) {
        try {
            console.log(`[Tool Service] Trying with ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.warn(`[Tool Service] FAILED with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw error;
        }
    }
}

module.exports = generateAnalysis;
