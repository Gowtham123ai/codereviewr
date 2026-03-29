const axios = require("axios");

// Version: 2.1.0-DIAGNOSTIC
async function aiService(code) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    if (!key) throw new Error("API Key is missing in Vercel settings.");

    try {
        console.log("[AI DIAGNOSTIC v2.1.0] Starting RAW FETCH attempt...");
        
        // We will try the most common models for different accounts
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        
        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
                
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: `Review code. Return JSON { "review": "...", "explanation": "...", "score": 0-100 }. Code: \n\n${code}` }] }]
                });

                if (response.data) {
                    const text = response.data.candidates[0].content.parts[0].text;
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
                    
                    return {
                        review: parsed.review || "Review Success",
                        explanation: parsed.explanation || "No issues found.",
                        score: parseInt(parsed.score) || 0
                    };
                }
            } catch (innerError) {
                console.warn(`[DIAGNOSTIC] ${model} failed:`, innerError.response ? innerError.response.data : innerError.message);
                if (model === models[models.length - 1]) throw innerError;
            }
        }
    } catch (err) {
        const errorDetail = err.response ? JSON.stringify(err.response.data) : err.message;
        throw new Error(`DIAGNOSTIC ERROR [v2.1.0]: ${errorDetail}`);
    }
}

aiService.simulateExecution = async (code, language) => {
    // Similar strategy for execution
    return { output: "Simulation skipped in diagnostic mode.", explanation: "Please check /api/list-models in browser." };
};

module.exports = aiService;
