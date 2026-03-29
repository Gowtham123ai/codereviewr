const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = process.env.GOOGLE_GEMINI_KEY || "";
const genAI = new GoogleGenerativeAI(key);

// Exhaustive list of standard model IDs to bypass 404/403 errors
const MODELS = ["models/gemini-1.5-flash", "models/gemini-1.0-pro", "models/gemini-1.5-flash-latest", "gemini-1.5-flash"];

async function tryModels(prompt, isExecution = false) {
    console.log(`[AI Service] Current Region: ${process.env.VERCEL_REGION || "Local"} | Env: ${process.env.VERCEL_ENV || "Dev"}`);
    
    for (const modelName of MODELS) {
        try {
            console.log(`[AI Service] Attempting ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const fullPrompt = isExecution 
                ? `Simulate code output and return JSON matching { "output": "...", "explanation": "..." }. Code: \n\n${prompt}`
                : `Review this code for quality and return JSON matching { "review": "...", "explanation": "...", "score": 0-100 }. Code: \n\n${prompt}`;
            
            const result = await model.generateContent(fullPrompt);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            console.log(`[AI Service] SUCCESS with ${modelName}!`);
            return parsed;
        } catch (error) {
            console.warn(`[AI Service] FAILED with ${modelName}:`, error.message);
            // If it's the last model and it fails, throw the final error
            if (modelName === MODELS[MODELS.length - 1]) throw error;
        }
    }
}

async function aiService(code) {
    try {
        const parsed = await tryModels(code, false);
        return {
            review: parsed.review || "Review Complete",
            explanation: parsed.explanation || "Analysis finished successfully.",
            score: parseInt(parsed.score) || 0
        };
    } catch (err) {
        throw new Error(`AI Critical Error: ${err.message}`);
    }
}

aiService.simulateExecution = async (code, language) => {
    try {
        const parsed = await tryModels(`Lang: ${language}\n${code}`, true);
        return {
            output: parsed.output || "Execution finished (no output).",
            explanation: parsed.explanation || `Simulated ${language} execution using AI.`
        };
    } catch (err) {
        throw new Error(`Execution Error: ${err.message}`);
    }
};

module.exports = aiService;
