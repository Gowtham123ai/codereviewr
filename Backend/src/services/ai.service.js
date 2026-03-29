const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.0.8-PURE - Global Stability Final
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    // FORCE STABLE V1 IN CONSTRUCTOR
    const genAI = new GoogleGenerativeAI(key, { apiVersion: "v1" });
    
    // PURE V1 MODELS
    const MODELS = ["gemini-1.5-flash", "gemini-1.0-pro"];

    console.log(`[AI Stability v1.0.8-PURE] Mode: ${isExecution ? 'Execute' : 'Review'}`);
    
    for (const modelName of MODELS) {
        try {
            console.log(`[AI Stability] Attempting ${modelName} on Absolute Stable v1...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
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
        throw new Error(`AI v1.0.8-PURE Error: ${err.message}`);
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
        throw new Error(`Execution v1.0.8-PURE Error: ${err.message}`);
    }
};

module.exports = aiService;
