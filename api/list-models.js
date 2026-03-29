const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    const key = process.env.GOOGLE_GEMINI_KEY || "";
    if (!key) return res.status(401).json({ error: "Key not found" });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        const models = (data.models || []).map(m => ({
            name: m.name,
            displayName: m.displayName,
            methods: m.supportedMethods
        }));

        res.status(200).json({ 
            version: "v1.3.0-RECON",
            availableModels: models,
            rawCount: models.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
