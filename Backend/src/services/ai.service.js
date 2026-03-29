const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.2.0-GEN2 - Next Gen Gemini 2.0
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // GEN-2 PROBE: Using models confirmed available on your account
    const PROBES = [
        { model: "gemini-2.0-flash", version: "v1beta" },
        { model: "gemini-flash-latest", version: "v1beta" },
        { model: "gemini-pro-latest", version: "v1beta" }
    ];

    console.log(`[AI GEN-2 v1.2.0] Powered by Gemini 2.0...`);
    
    for (const probe of PROBES) {
        try {
            console.log(`[GEN-2 Probe] Testing ${probe.model} on ${probe.version}...`);
            const model = genAI.getGenerativeModel(
                { model: probe.model },
                { apiVersion: probe.version }
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
            console.warn(`[GEN-2 Probe] ${probe.model} Failed:`, error.message);
            if (probe === PROBES[PROBES.length - 1]) throw error;
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
        throw new Error(`AI v1.2.0-GEN2 Error: ${err.message}`);
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
        throw new Error(`Execution v1.2.0-GEN2 Error: ${err.message}`);
    }
};

module.exports = aiService;
