const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.9-SUPREME - Absolute Stability Final
async function useTool(toolName, code) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // SUPREME V1 MODELS
    const MODELS = ["gemini-1.5-flash"];

    for (const modelName of MODELS) {
        try {
            console.log(`[Tool Service v1.0.9-SUPREME] Using ${toolName} with ${modelName} on Absolute Stable v1...`);
            
            // OFFICIAL SYNTAX: Pass apiVersion as 2nd argument
            const model = genAI.getGenerativeModel(
                { model: modelName },
                { apiVersion: "v1" }
            );
            
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
            console.warn(`[Tool Service v1.0.9-SUPREME] FAILED with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw new Error(`Tool v1.0.9-SUPREME Error: ${error.message}`);
        }
    }
}

module.exports = { useTool };
