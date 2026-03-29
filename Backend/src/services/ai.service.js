const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.5.0-STABLE - Rate-Limit Resilient Engine
async function tryModels(prompt, isExecution = false) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // THE STABLE PROBE: prioritized by connection success (429 > 404)
    const PROBES = [
        { model: "gemini-pro-latest", version: "v1beta" },
        { model: "gemini-2.0-flash", version: "v1beta" },
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-pro", version: "v1" }
    ];

    console.log(`[AI STABLE v1.5.0] Connecting...`);
    
    for (const probe of PROBES) {
        try {
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
            // If it's a rate limit error (429), just wait and move to the next or retry
            if (error.message.includes("429")) {
                console.warn(`[STABLE] ${probe.model} Rate Limited. Cooling down...`);
                // Continue to next probe in list
            } else {
                console.warn(`[STABLE] ${probe.model} [${probe.version}] Failed:`, error.message);
            }
            
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
        throw new Error(`AI v1.5.0-STABLE Error: ${err.message}`);
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
        throw new Error(`Execution v1.5.0-STABLE Error: ${err.message}`);
    }
};

module.exports = aiService;
