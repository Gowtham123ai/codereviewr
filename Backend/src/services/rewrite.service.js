const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.5.1-SYNC - Universal Rate-Limit Resilient Engine (Direct Export)
async function rewriteService(prompt) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // UNIVERSAL PROBE LIST (Synced with ai.service.js)
    const PROBES = [
        { model: "gemini-pro-latest", version: "v1beta" },
        { model: "gemini-2.0-flash", version: "v1beta" },
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-pro", version: "v1" }
    ];

    for (const probe of PROBES) {
        try {
            console.log(`[Rewrite SYNC] Testing ${probe.model} [${probe.version}]...`);
            const model = genAI.getGenerativeModel(
                { model: probe.model },
                { apiVersion: probe.version }
            );
            
            const result = await model.generateContent(`Rewrite this code and return JSON: { "rewrittenCode": "...", "explanation": "..." }. Code:\n\n${prompt}`);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            return {
                rewrittenCode: parsed.rewrittenCode || text,
                explanation: parsed.explanation || "Rewrite successful"
            };
        } catch (error) {
            console.warn(`[Rewrite SYNC] ${probe.model} Failed:`, error.message);
            if (probe === PROBES[PROBES.length - 1]) throw error;
        }
    }
}

module.exports = rewriteService;
