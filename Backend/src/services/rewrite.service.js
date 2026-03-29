const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.8-ULTRA - Global Stability Update
async function generateRewrite(prompt) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // PURE V1 MODELS: No models/ prefix
    const MODELS = ["gemini-1.5-flash", "gemini-1.0-pro"];

    for (const modelName of MODELS) {
        try {
            console.log(`[Rewrite Service v1.0.8-ULTRA] Trying with ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                apiVersion: 'v1' 
            });
            
            const result = await model.generateContent(`Rewrite this code and return JSON: { "rewrittenCode": "...", "explanation": "..." }. Code:\n\n${prompt}`);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            return {
                rewrittenCode: parsed.rewrittenCode || text,
                explanation: parsed.explanation || "Rewrite successful"
            };
        } catch (error) {
            console.warn(`[Rewrite Service v1.0.8-ULTRA] FAILED with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw error;
        }
    }
}

module.exports = generateRewrite;
