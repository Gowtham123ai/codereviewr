const { probeAI } = require("./ai.utils");

// Version: 1.6.0-PROBE - Universal Probe Integration
async function rewriteService(promptOriginal) {
    try {
        const prompt = `Rewrite this code and return JSON: { "rewrittenCode": "...", "explanation": "..." }. Code:\n\n${promptOriginal}`;
        const parsed = await probeAI(prompt);
        
        return {
            rewrittenCode: parsed.rewrittenCode || parsed.raw || promptOriginal,
            explanation: parsed.explanation || "Rewrite successful"
        };
    } catch (err) {
        console.error("Rewrite service failed:", err.message);
        throw err;
    }
}

module.exports = rewriteService;
