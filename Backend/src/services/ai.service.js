const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with the API KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || "");

// CONFIG: Using only stable 1.5-flash for maximum authorization compatibility
const MODEL_NAME = "gemini-1.5-flash";

const reviewModel = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: "You are a Senior Software Engineer. Review the code and return only a JSON object: { \"review\": \"markdown findings\", \"explanation\": \"summary\", \"score\": 0-100 }."
});

const executeModel = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: "You are a code simulator. Simulate output and return only JSON: { \"output\": \"result\", \"explanation\": \"note\" }."
});

async function aiService(code) {
  try {
    console.log(`[AI Service] Starting review with ${MODEL_NAME}...`);
    const result = await reviewModel.generateContent(code);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
    
    return {
      review: parsed.review || text,
      explanation: parsed.explanation || "Review successful.",
      score: parsed.score || 0
    };
  } catch (error) {
    console.error(`[AI Service] Review Error (${MODEL_NAME}):`, error.message);
    throw error;
  }
}

aiService.simulateExecution = async (code, language) => {
  try {
    console.log(`[AI Service] Starting simulation with ${MODEL_NAME}...`);
    const result = await executeModel.generateContent(`Language: ${language}\nCode:\n${code}`);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim());
    
    return {
      output: parsed.output || text,
      explanation: parsed.explanation || `Simulated ${language} execution.`
    };
  } catch (error) {
    console.error(`[AI Service] Simulation Error (${MODEL_NAME}):`, error.message);
    throw error;
  }
};

module.exports = aiService;
