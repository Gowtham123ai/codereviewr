const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || "");
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

async function generateRewrite(prompt) {
    try {
        const result = await model.generateContent(`Rewrite this code professionally and fix bugs. Return JSON: { "rewrittenCode": "...", "explanation": "..." }. Code:\n\n${prompt}`);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
        
        return {
            rewrittenCode: parsed.rewrittenCode || text,
            explanation: parsed.explanation || "Rewrite success"
        };
    } catch (error) {
        console.error(`[Rewrite Service] Error:`, error.message);
        throw new Error(`Rewrite Gateway Error: ${error.message}`);
    }
}

module.exports = generateRewrite;
