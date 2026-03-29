const { GoogleGenerativeAI } = require("@google/generative-ai");

// Version: 2.0.0-FINAL
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || "");

async function aiService(code) {
    try {
        // Locked to gemini-1.5-flash on v1beta as per instructions
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });
        
        const prompt = `Review code. Return JSON { "review": "...", "explanation": "...", "score": 0-100 }. Code: \n\n${code}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
        
        return {
            review: parsed.review || "Review Success",
            explanation: parsed.explanation || "No issues found.",
            score: parseInt(parsed.score) || 0
        };
    } catch (err) {
        console.error("AI Service Error:", err);
        throw new Error(`AI v2.0.0-FINAL Error: ${err.message}`);
    }
}

aiService.simulateExecution = async (code, language) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });
        const prompt = `Simulate execution for ${language}. Return JSON { "output": "...", "explanation": "..." }. Code:\n\n${code}`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
        
        return {
            output: parsed.output || "Done.",
            explanation: parsed.explanation || "Simulation complete."
        };
    } catch (err) {
        console.error("Execution Error:", err);
        throw new Error(`Execution v2.0.0-FINAL Error: ${err.message}`);
    }
};

module.exports = aiService;
