const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = process.env.GOOGLE_GEMINI_KEY || "";
const genAI = new GoogleGenerativeAI(key);

// Using 1.0-pro as the PRIMARY for ultimate compatibility with restricted keys
const MODELS = ["gemini-pro", "models/gemini-1.5-flash", "models/gemini-1.0-pro"];

async function tryModels(prompt, isExecution = false) {
    // Diagnostic log for regions
    console.log(`[AI Service] Region: ${process.env.VERCEL_REGION || "Local"} | Vercel Env: ${process.env.VERCEL_ENV || "Dev"}`);
    
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
            console.log(`[AI Service] Success with ${modelName}!`);
            return parsed;
        } catch (error) {
            console.warn(`[AI Service] Fail with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw error;
        }
    }
}

async function aiService(code) {
    try {
        const parsed = await tryModels(code, false);
        return {
            review: parsed.review || "Reviewed",
            explanation: parsed.explanation || "Complete",
            score: parsed.score || 0
        };
    } catch (err) {
        throw new Error(`AI Critical Error: ${err.message}`);
    }
}

aiService.simulateExecution = async (code, language) => {
    try {
        const parsed = await tryModels(`Lang: ${language}\n${code}`, true);
        return {
            output: parsed.output || "Done",
            explanation: parsed.explanation || `Simulated ${language}.`
        };
    } catch (err) {
        throw new Error(`Sim Error: ${err.message}`);
    }
};

module.exports = aiService;
