const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.9-SUPREME - Absolute Stability Final
async function generateRewrite(prompt) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // SUPREME V1 MODELS
    const MODELS = ["gemini-1.5-flash"];

    for (const modelName of MODELS) {
        try {
            console.log(`[Rewrite Service v1.0.9-SUPREME] Using ${modelName} on Absolute Stable v1...`);
            
            // OFFICIAL SYNTAX: Pass apiVersion as 2nd argument
            const model = genAI.getGenerativeModel(
                { model: modelName },
                { apiVersion: "v1" }
            );
            
            const result = await model.generateContent(`Rewrite this code and return JSON: { "rewrittenCode": "...", "explanation": "..." }. Code:\n\n${prompt}`);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            return {
                rewrittenCode: parsed.rewrittenCode || text,
                explanation: parsed.explanation || "Rewrite successful"
            };
        } catch (error) {
            console.warn(`[Rewrite Service v1.0.9-SUPREME] FAILED with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw new Error(`Rewrite v1.0.9-SUPREME Error: ${error.message}`);
        }
    }
}

module.exports = { generateRewrite };
