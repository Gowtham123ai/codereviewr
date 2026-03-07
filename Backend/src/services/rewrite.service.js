const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction: `
You are a senior software engineer. Rewrite the code professionally, fix bugs, optimize it, and improve readability.
Return the result in JSON format:
{
  "rewrittenCode": "the improved code string",
  "explanation": "a short summary of what was changed and why"
}
Return ONLY the JSON. No markdown.
`
});

async function generateRewrite(prompt) {
  const maxRetries = 5;
  const retryDelay = 5000;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      try {
        // Find JSON block even if there is text around it
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonStr.replace(/```json|```/g, ""));
        return {
          rewrittenCode: parsed.rewrittenCode || parsed.improvedCode || parsed.code || text,
          explanation: parsed.explanation || "Code rewritten successfully."
        };
      } catch (e) {
        return { rewrittenCode: text, explanation: "Code rewritten successfully." };
      }
    } catch (error) {
      const isRetryable = error.status === 503 || error.status === 429 || error.message?.includes("503") || error.message?.includes("429");
      if (isRetryable && i < maxRetries) {
        console.warn(`Gemini error (${error.status}) (Rewrite), retrying (${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        continue;
      }
      console.error("Gemini API Error (Rewrite):", error);
      throw error;
    }
  }
}

module.exports = generateRewrite;
