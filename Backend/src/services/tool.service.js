const { probeAI } = require("./ai.utils");

// Version: 1.6.0-PROBE - Universal Probe Integration
async function toolService(code, toolName) {
    try {
        const prompt = `Use tool ${toolName} on this code and return JSON: { "result": "...", "explanation": "..." }. Code:\n\n${code}`;
        const parsed = await probeAI(prompt);
        
        return parsed.result || parsed.raw || "Done.";
    } catch (err) {
        console.error(`Tool service [${toolName}] failed:`, err.message);
        throw err;
    }
}

module.exports = toolService;
