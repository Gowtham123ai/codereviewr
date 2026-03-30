const { probeAI } = require("./ai.utils");

// Version: 1.6.0-PROBE - Universal Probe Integration
async function aiService(code) {
    try {
        const prompt = `Review code. Return JSON { "review": "...", "explanation": "...", "score": 0-100 }. Code: \n\n${code}`;
        const parsed = await probeAI(prompt);
        
        return {
            review: parsed.review || parsed.raw || "Review Success",
            explanation: parsed.explanation || "No issues found.",
            score: parseInt(parsed.score) || 0
        };
    } catch (err) {
        throw new Error(`AI v1.6.0-PROBE Error: ${err.message}`);
    }
}

aiService.simulateExecution = async (code, language) => {
    try {
        const prompt = `Return JSON { "output": "...", "explanation": "..." } for: \n\nLanguage: ${language}\nCode:\n${code}`;
        const parsed = await probeAI(prompt);
        
        return {
            output: parsed.output || parsed.raw || "Done.",
            explanation: parsed.explanation || "Simulation complete."
        };
    } catch (err) {
        throw new Error(`Execution v1.6.0-PROBE Error: ${err.message}`);
    }
};

module.exports = aiService;
