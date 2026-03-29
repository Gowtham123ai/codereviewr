const { GoogleGenerativeAI } = require("@google/generative-ai");

// diagnostic log
console.log("[AI Service] Initializing with key length:", process.env.GOOGLE_GEMINI_KEY?.length || 0);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a Senior Software Engineer. Perform a code review and return exactly one JSON object: { \"review\": \"...\", \"explanation\": \"...\", \"score\": 0-100 }. Do not include any other text."
});

async function aiService(code) {
  try {
    const result = await model.generateContent(code);
    const text = result.response.text();
    console.log("[AI Service] Received response from Gemini.");
    
    // Clean markdown and extract JSON
    const cleanText = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : cleanText;
    
    const parsed = JSON.parse(jsonStr);
    return {
      review: parsed.review || text,
      explanation: parsed.explanation || "Review success",
      score: parsed.score || 0
    };
  } catch (error) {
    console.error("[AI Service] Runtime Error:", error.message);
    throw error;
  }
}

aiService.simulateExecution = async (code, language) => {
    const execModel = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are a compiler. Return JSON: { \"output\": \"result\", \"explanation\": \"...\" }"
    });
    try {
        const result = await execModel.generateContent(`Simulate execution for ${language}:\n${code}`);
        const text = result.response.text().trim().replace(/```json|```/g, "");
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
        console.error("[AI Service] Simulation Error:", e.message);
        throw e;
    }
};

module.exports = aiService;
