const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 2.0.0-FINAL
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || "");

/**
 * REWRITE SERVICE (Direct Export)
 */
async function rewriteService(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });
        
        const result = await model.generateContent(`Rewrite this code and return JSON: { "rewrittenCode": "...", "explanation": "..." }. Code:\n\n${prompt}`);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
        
        return {
            rewrittenCode: parsed.rewrittenCode || text,
            explanation: parsed.explanation || "Rewrite successful"
        };
    } catch (err) {
        console.error("Rewrite Error:", err);
        throw new Error(`Rewrite v2.0.0-FINAL Error: ${err.message}`);
    }
}

module.exports = rewriteService;
