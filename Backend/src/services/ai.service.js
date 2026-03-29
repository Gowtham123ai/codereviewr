const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
You are a Senior Software Engineer. Review the code and return JSON:
{
  "review": "markdown review",
  "explanation": "summary",
  "score": "0-100"
}
Return ONLY the JSON.
`
});

async function generateContent(prompt) {
  const maxRetries = 3;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(jsonStr.replace(/```json|```/g, ""));
      return {
        review: parsed.review || text,
        explanation: parsed.explanation || "Review success",
        score: parsed.score || 0
      };
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function simulateExecution(code, language) {
    const execModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: "You are a code execution engine. Return JSON: { \"output\": \"output string\", \"explanation\": \"note\" }"
    });
    try {
        const result = await execModel.generateContent(`Language: ${language}\nCode:\n${code}`);
        const text = result.response.text().trim().replace(/```json|```/g, "");
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
        console.error("Simulation Error:", e);
        return { output: "Simulation failed", explanation: e.message };
    }
}

const aiService = generateContent;
aiService.simulateExecution = simulateExecution;

module.exports = aiService;
