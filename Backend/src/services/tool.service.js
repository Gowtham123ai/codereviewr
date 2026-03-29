const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.8-PURE - Global Stability Final
async function useTool(toolName, code) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    // FORCE STABLE V1 IN CONSTRUCTOR
    const genAI = new GoogleGenerativeAI(key, { apiVersion: "v1" });
    
    // PURE V1 MODELS
    const MODELS = ["gemini-1.5-flash", "gemini-1.0-pro"];

    for (const modelName of MODELS) {
        try {
            console.log(`[Tool Service v1.0.8-PURE] Using ${toolName} with ${modelName} on Absolute Stable v1...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const prompt = `Use tool ${toolName} on this code and return JSON: { "result": "...", "explanation": "..." }. Code:\n\n${code}`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            return {
                result: parsed.result || text,
                explanation: parsed.explanation || "Tool processed successfully"
            };
        } catch (error) {
            console.warn(`[Tool Service v1.0.8-PURE] FAILED with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw new Error(`Tool v1.0.8-PURE Error: ${error.message}`);
        }
    }
}

module.exports = { useTool };
