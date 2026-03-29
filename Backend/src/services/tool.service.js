const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.2.0-GEN2 - Next Gen Gemini 2.0 (Direct Export)
async function toolService(code, toolName) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    
    // GEN-2 PROBE
    const PROBES = [
        { model: "gemini-2.0-flash", version: "v1beta" },
        { model: "gemini-flash-latest", version: "v1beta" }
    ];

    for (const probe of PROBES) {
        try {
            console.log(`[Tool GEN-2] Testing ${probe.model} on lane ${probe.version}...`);
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
            console.warn(`[Tool GEN-2] Failed with ${probe.model}:`, error.message);
            if (probe === PROBES[PROBES.length - 1]) throw new Error(`Tool v1.2.0-GEN2 Error: ${error.message}`);
        }
    }
}

module.exports = toolService;
