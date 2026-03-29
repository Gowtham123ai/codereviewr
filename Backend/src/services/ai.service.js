const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.5 - Atomic Connection Update
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // Explicit list of versioned models
    const MODELS = [
        "gemini-1.5-flash", 
        "gemini-pro",
        "models/gemini-1.5-flash",
        "models/gemini-1.0-pro"
    ];

    console.log(`[AI Update v1.0.5] Processing in ${process.env.VERCEL_REGION || "Local"}`);
    
    for (const modelName of MODELS) {
        try {
            console.log(`[AI Update] Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const fullPrompt = isExecution 
                ? `Simulate output. return JSON { "output": "...", "explanation": "..." }. Code: \n\n${prompt}`
                : `Review code. return JSON { "review": "...", "explanation": "...", "score": 0-100 }. Code: \n\n${prompt}`;
            
            const result = await model.generateContent(fullPrompt);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            console.log(`[AI Update] Success with ${modelName}!`);
            return parsed;
        } catch (error) {
            console.warn(`[AI Update] Fail with ${modelName}:`, error.message);
            if (modelName === MODELS[MODELS.length - 1]) throw error;
        }
    }
}

async function aiService(code) {
    try {
        const parsed = await tryModels(code, false);
        return {
            review: parsed.review || "Success",
            explanation: parsed.explanation || "Analysis finished.",
            score: parseInt(parsed.score) || 0
        };
    } catch (err) {
        throw new Error(`AI Deployment Error [v1.0.5]: ${err.message}`);
    }
}

aiService.simulateExecution = async (code, language) => {
    try {
        const parsed = await tryModels(`Lang: ${language}\n${code}`, true);
        return {
            output: parsed.output || "Done.",
            explanation: parsed.explanation || "Simulation complete."
        };
    } catch (err) {
        throw new Error(`Execution Error [v1.0.5]: ${err.message}`);
    }
};

module.exports = aiService;
