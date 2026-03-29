const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 2.0.0-FINAL
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || "");

/**
 * TOOL SERVICE (Direct Export)
 */
async function toolService(code, toolName) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });
        
        const prompt = `Use tool ${toolName} on this code and return JSON: { "result": "...", "explanation": "..." }. Code:\n\n${code}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
        
        return parsed.result || text;
    } catch (err) {
        console.error("Tool Error:", err);
        throw new Error(`Tool v2.0.0-FINAL Error: ${err.message}`);
    }
}

module.exports = toolService;
