const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Universal Probing Engine for Gemini Models
 * Handles 404 (Missing Models) and 429 (Rate Limits) gracefully by trying alternatives
 */
async function probeAI(prompt, systemInstruction = null) {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    if (!key) throw new Error("GOOGLE_GEMINI_KEY is missing in environment variables.");
    
    const genAI = new GoogleGenerativeAI(key);

    const PROBES = [
        // FUTURE MODELS (2026)
        { model: "gemini-2.5-flash-latest", version: "v1beta" },
        { model: "gemini-2.5-flash", version: "v1beta" },
        { model: "gemini-2.0-flash-latest", version: "v1beta" },
        { model: "gemini-2.0-flash", version: "v1beta" },
        // STABLE MODELS
        { model: "gemini-1.5-flash-latest", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-1.5-flash-8b", version: "v1" },
        { model: "gemini-1.5-pro-latest", version: "v1" },
        { model: "gemini-2.0-flash-exp", version: "v1beta" }
    ];

    for (const probe of PROBES) {
        try {
            console.log(`[AI PROBE] Trying ${probe.model} [${probe.version}]...`);
            
            const modelConfig = { model: probe.model };
            if (systemInstruction) {
                modelConfig.systemInstruction = systemInstruction;
            }

            const model = genAI.getGenerativeModel(
                modelConfig,
                { apiVersion: probe.version }
            );

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const content = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, "").trim();
            
            try {
                return JSON.parse(content);
            } catch (pErr) {
                return { raw: responseText };
            }

        } catch (error) {
            const isRateLimit = error.message.includes("429") || error.status === 429;
            const isNotFound = error.message.includes("404") || error.status === 404;

            if (isRateLimit) {
                console.warn(`[AI PROBE] ${probe.model} Rate Limited. Trying next...`);
                await new Promise(r => setTimeout(r, 500));
            } else if (isNotFound) {
                console.warn(`[AI PROBE] ${probe.model} [${probe.version}] Not Found. Skipping...`);
            } else {
                console.warn(`[AI PROBE] ${probe.model} [${probe.version}] Error:`, error.message);
            }

            if (probe === PROBES[PROBES.length - 1]) throw error;
        }
    }
}

module.exports = { probeAI };
