const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = process.env.GOOGLE_GEMINI_KEY || "";
const genAI = new GoogleGenerativeAI(key);

// Using the FULL model path to bypass authorization quirks
const MODEL_NAME = "models/gemini-1.5-flash";

async function aiService(code) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Review this code and return JSON: { "review": "findings", "explanation": "summary", "score": 0-100 }. Code:\n\n${code}`;
    
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
    console.error(`[AI Service] Error:`, error.message);
    // Return a more descriptive error for the UI
    throw new Error(`AI Gateway Error: ${error.message}`);
  }
}

aiService.simulateExecution = async (code, language) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(`Simulate ${language} output. Return JSON: { "output": "...", "explanation": "..." }. Code:\n\n${code}`);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
  } catch (e) {
    throw new Error(`Simulation Error: ${e.message}`);
  }
};

module.exports = aiService;
