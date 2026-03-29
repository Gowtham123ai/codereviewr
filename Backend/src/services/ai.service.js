const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.6 - API v1 Compatibility Update
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    
    // FORCING v1 API VERSION: This is the most compatible way for all Google AI Studio keys
    const genAI = new GoogleGenerativeAI(key);
    
    const MODELS = [
        "gemini-1.5-flash",    // Standard v1 name
        "gemini-1.0-pro",      // Pro v1 name
        "gemini-pro"           // Pro fallback
    ];

    console.log(`[AI Stability v1.0.6] Mode: ${isExecution ? 'Execute' : 'Review'} | Env: ${process.env.VERCEL_ENV || "Dev"}`);
    
    for (const modelName of MODELS) {
        try {
            console.log(`[AI Stability] Attempting ${modelName} on API v1...`);
            
            // Using the specific v1 version of the client if possible
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                apiVersion: 'v1' // Force stable API version
            });
            
            const fullPrompt = isExecution 
                ? `Return JSON { "output": "...", "explanation": "..." } for this ${isExecution} code: \n\n${prompt}`
                : `Review code. Return JSON { "review": "...", "explanation": "...", "score": 0-100 }. Code: \n\n${prompt}`;
            
            const result = await model.generateContent(fullPrompt);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            return parsed;
        } catch (error) {
            console.warn(`[AI Stability] Error with ${modelName}:`, error.message);
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
        throw new Error(`AI v1 Error [1.0.6]: ${err.message}`);
    }
}

aiService.simulateExecution = async (code, language) => {
    try {
        const parsed = await tryModels(`Language: ${language}\nCode:\n${code}`, true);
        return {
            output: parsed.output || "Done.",
            explanation: parsed.explanation || "Simulation complete."
        };
    } catch (err) {
        throw new Error(`Execution Error [1.0.6]: ${err.message}`);
    }
};

module.exports = aiService;
