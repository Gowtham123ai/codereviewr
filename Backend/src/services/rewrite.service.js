const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = process.env.GOOGLE_GEMINI_KEY || "";
const genAI = new GoogleGenerativeAI(key);

const MODELS = ["models/gemini-1.5-flash", "models/gemini-1.0-pro", "gemini-pro"];

async function generateRewrite(prompt) {
    for (const modelName of MODELS) {
        try {
            console.log(`[Rewrite Service] Trying with ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(`Rewrite this code and return JSON: { "rewrittenCode": "...", "explanation": "..." }. Code:\n\n${prompt}`);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            return {
                rewrittenCode: parsed.rewrittenCode || text,
                explanation: parsed.explanation || "Rewrite successful"
            };
        } catch (error) {
            console.warn(`[Rewrite Service] FAILED with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw error;
        }
    }
}

module.exports = generateRewrite;
