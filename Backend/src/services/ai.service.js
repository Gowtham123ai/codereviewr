const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.4.0-ULTRA - Intelligent Triple-Lane Prober
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // THE ULTIMATE PROBE: Models confirmed available + proper lanes
    const PROBES = [
        { model: "gemini-2.0-flash", version: "v1beta" },
        { model: "gemini-flash-latest", version: "v1beta" },
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-pro", version: "v1" }
    ];

    console.log(`[AI ULTRA v1.4.0] Powering up...`);
    
    for (const probe of PROBES) {
        try {
            console.log(`[ULTRA Probe] Testing ${probe.model} [${probe.version}]...`);
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
            
            console.log(`[ULTRA Probe] SUCCESS on ${probe.model} (${probe.version})!`);
            return parsed;
        } catch (error) {
            console.warn(`[ULTRA Probe] ${probe.model} Failed:`, error.message);
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
        throw new Error(`AI v1.4.0-ULTRA Error: ${err.message}`);
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
        throw new Error(`Execution v1.4.0-ULTRA Error: ${err.message}`);
    }
};

module.exports = aiService;
