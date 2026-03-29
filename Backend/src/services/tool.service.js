const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.8-ULTRA - Global Stability Update
async function generateAnalysis(code, type) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // PURE V1 MODELS: No models/ prefix
    const MODELS = ["gemini-1.5-flash", "gemini-1.0-pro"];

    const prompt = type === "explain"
        ? `Explain this code simply:\n\n${code}`
        : `Detect bugs and return a short list:\n\n${code}`;

    for (const modelName of MODELS) {
        try {
            console.log(`[Tool Service v1.0.8-ULTRA] Trying with ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                apiVersion: 'v1' 
            });
            
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.warn(`[Tool Service v1.0.8-ULTRA] FAILED with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw error;
        }
    }
}

module.exports = generateAnalysis;
