const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.2.0-ULTIMATE - Intelligent Model Discovery
async function generateRewrite(prompt) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // TRIPLE-LANE PROBE: Trying all valid combinations for your API key
    const PROBES = [
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-pro", version: "v1" }
    ];

    for (const probe of PROBES) {
        try {
            console.log(`[Rewrite Probe] Testing ${probe.model} on lane ${probe.version}...`);
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
            console.warn(`[Rewrite Probe] Lane ${probe.version} (${probe.model}) - Failed:`, error.message);
            if (probe === PROBES[PROBES.length - 1]) throw new Error(`Rewrite v1.2.0-ULTIMATE Error: ${error.message}`);
        }
    }
}

module.exports = { generateRewrite };
