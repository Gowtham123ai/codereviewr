const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function generateAnalysis(code, type) {
    const prompt = type === "explain"
        ? `Explain this code in simple terms:\n\n${code}`
        : `Find potential bugs and issues in this code. Provide a concise list of problems and suggestions:\n\n${code}`;

    const maxRetries = 3;
    const retryDelay = 2000;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            const isRetryable = error.status === 503 || error.status === 429;
            if (isRetryable && i < maxRetries) {
                console.warn(`Gemini Error (${error.status}) - Retrying Tools (${i + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
                continue;
            }
            throw error;
        }
    }
}

module.exports = generateAnalysis;
