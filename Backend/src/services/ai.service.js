const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini safely
const key = process.env.GOOGLE_GEMINI_KEY || "";
console.log("[AI Service] Initializing with key present:", !!key);

const genAI = new GoogleGenerativeAI(key);

async function aiService(code) {
  try {
    // Basic model initialization without system instructions
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Review this code for quality, bugs, and improvements. Return only JSON: { "review": "markdown findings", "explanation": "summary", "score": 0-100 }. Code:\n\n${code}`;
    
    console.log("[AI Service] Sending basic prompt to Gemini Pro...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
    
    return {
      review: parsed.review || text,
      explanation: parsed.explanation || "Review complete.",
      score: parsed.score || 0
    };
  } catch (error) {
    console.error("[AI Service] Runtime Error:", error.message);
    throw error;
  }
}

aiService.simulateExecution = async (code, language) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Simulate console output for this ${language} code and return only JSON: { "output": "result string", "explanation": "note" }. Code:\n\n${code}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
    
    return {
      output: parsed.output || text,
      explanation: parsed.explanation || `Simulated ${language} execution.`
    };
  } catch (error) {
    console.error("[AI Service] Simulation Error:", error.message);
    throw error;
  }
};

module.exports = aiService;
