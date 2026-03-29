const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.1.0-STABLE - Final API Bridge
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // STABLE MODELS: Flash is the primary, Pro as fallback
    const MODELS = ["gemini-1.5-flash", "gemini-pro"];

    console.log(`[AI Stability v1.1.0-STABLE] Mode: ${isExecution ? 'Execute' : 'Review'}`);
    
    for (const modelName of MODELS) {
        try {
            console.log(`[AI Stability] Attempting ${modelName} via v1beta bridge...`);
            
            // BRIDGE SYNTAX: Use v1beta for Gemini 1.5 Flash compatibility
            const model = genAI.getGenerativeModel(
                { model: modelName },
                { apiVersion: "v1beta" }
            );
            
            const fullPrompt = isExecution 
                ? `Return JSON { "output": "...", "explanation": "..." } for: \n\n${prompt}`
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
            review: parsed.review || "Review Success",
            explanation: parsed.explanation || "No issues found.",
            score: parseInt(parsed.score) || 0
        };
    } catch (err) {
        throw new Error(`AI v1.1.0-STABLE Error: ${err.message}`);
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
        throw new Error(`Execution v1.1.0-STABLE Error: ${err.message}`);
    }
};

module.exports = aiService;
