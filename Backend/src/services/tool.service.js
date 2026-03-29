const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.5.1-SYNC - Universal Rate-Limit Resilient Engine (Direct Export)
async function toolService(code, toolName) {
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
            console.log(`[Tool SYNC] Testing ${probe.model} [${probe.version}]...`);
            const model = genAI.getGenerativeModel(
                { model: probe.model },
                { apiVersion: probe.version }
            );
            
            const prompt = `Use tool ${toolName} on this code and return JSON: { "result": "...", "explanation": "..." }. Code:\n\n${code}`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            return parsed.result || text;
        } catch (error) {
            console.warn(`[Tool SYNC] ${probe.model} Failed:`, error.message);
            if (probe === PROBES[PROBES.length - 1]) throw error;
        }
    }
}

module.exports = toolService;
