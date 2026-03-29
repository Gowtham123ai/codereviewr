const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 1.2.1-ULTIMATE - Intelligent Model Discovery (Direct Export)
async function toolService(code, toolName) {
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
            console.log(`[Tool Probe] Testing ${probe.model} on lane ${probe.version}...`);
            const model = genAI.getGenerativeModel(
                { model: probe.model },
                { apiVersion: probe.version }
            );
            
            const prompt = `Use tool ${toolName} on this code and return JSON: { "result": "...", "explanation": "..." }. Code:\n\n${code}`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
            
            // Format result to match controller requirements
            const finalResult = parsed.result || text;
            return finalResult;
        } catch (error) {
            console.warn(`[Tool Probe] Lane ${probe.version} (${probe.model}) - Failed:`, error.message);
            if (probe === PROBES[PROBES.length - 1]) throw new Error(`Tool v1.2.1-ULTIMATE Error: ${error.message}`);
        }
    }
}

module.exports = toolService;
