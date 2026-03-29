const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.2.0-GEN2 - Next Gen Gemini 2.0 (Direct Export)
async function rewriteService(prompt) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // GEN-2 PROBE
    const PROBES = [
        { model: "gemini-2.0-flash", version: "v1beta" },
        { model: "gemini-flash-latest", version: "v1beta" }
    ];

    for (const probe of PROBES) {
        try {
            console.log(`[Rewrite GEN-2] Testing ${probe.model} on lane ${probe.version}...`);
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
            console.warn(`[Rewrite GEN-2] Failed with ${probe.model}:`, error.message);
            if (probe === PROBES[PROBES.length - 1]) throw new Error(`Rewrite v1.2.0-GEN2 Error: ${error.message}`);
        }
    }
}

module.exports = rewriteService;
