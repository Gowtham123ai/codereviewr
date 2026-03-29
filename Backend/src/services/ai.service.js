const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.2.0-ULTIMATE - Intelligent Model Discovery
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // TRIPLE-LANE PROBE: Trying all valid combinations for your API key
    const PROBES = [
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-pro", version: "v1" }
    ];

    console.log(`[AI ULTIMATE v1.2.0] Discovery Probing Started...`);
    
    for (const probe of PROBES) {
        try {
            console.log(`[AI Probe] Testing ${probe.model} on lane ${probe.version}...`);
            
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
            
            console.log(`[AI Probe] SUCCESS on ${probe.model} (${probe.version})!`);
            return parsed;
        } catch (error) {
            console.warn(`[AI Probe] Lane ${probe.version} (${probe.model}) - Failed:`, error.message);
            // If it's the last probe, we've exhausted all options
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
        throw new Error(`AI v1.2.0-ULTIMATE Error: ${err.message}`);
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
        throw new Error(`Execution v1.2.0-ULTIMATE Error: ${err.message}`);
    }
};

module.exports = aiService;
