const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.3.0-RECON - Master Model Probe
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    if (!key) throw new Error("API Key is missing in Vercel environment variables.");
    
    // Log masked key for diagnostic (e.g. AIz... ending in XY)
    const maskedKey = `${key.substring(0, 4)}...${key.substring(key.length - 2)}`;
    console.log(`[AI RECON] Using Key: ${maskedKey}`);

    const genAI = new GoogleGenerativeAI(key);
    
    // RECON PROBE: Trying the absolute widest net of model IDs and lanes
    const PROBES = [
        { model: "gemini-1.5-flash-latest", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-1.0-pro", version: "v1" },
        { model: "gemini-pro", version: "v1" }
    ];

    console.log(`[AI RECON v1.3.0] Searching for a valid model path...`);
    
    for (const probe of PROBES) {
        try {
            console.log(`[RECON Probe] Testing ${probe.model} [${probe.version}]...`);
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
            
            console.log(`[RECON Probe] CRITICAL SUCCESS on ${probe.model} (${probe.version})!`);
            return parsed;
        } catch (error) {
            console.warn(`[RECON Probe] ${probe.model} [${probe.version}] FAILED:`, error.message);
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
        throw new Error(`AI v1.3.0-RECON Error: ${err.message}`);
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
        throw new Error(`Execution v1.3.0-RECON Error: ${err.message}`);
    }
};

module.exports = aiService;
