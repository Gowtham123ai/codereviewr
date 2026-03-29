const aiService = require("../services/ai.service")


module.exports.getReview = async (req, res) => {
    const code = req.body.code;

    if (!code) {
        return res.status(400).send("Prompt is required");
    }

    try {
        console.log(`[Review Controller] Starting analysis...`);
        const response = await aiService(code);
        console.log(`[Review Controller] Analysis complete.`);
        res.json(response);
    } catch (error) {
        console.error("Controller Error (Review):", error);
        const status = error.status || 500;
        let message = "Internal Server Error: AI service failed.";

        if (status === 503) {
            message = "AI service temporarily unavailable. Please try again later.";
        } else if (status === 429) {
            message = "AI Quota exceeded. Please wait a moment and try again.";
        }

        res.status(status).json({
            success: false,
            message: message,
            provider: "Gemini"
        });
    }
}

module.exports.execute = async (req, res) => {
    const { code, language } = req.body;
    if (!code) return res.status(400).send("Code is required");

    try {
        console.log(`[Execute Controller] Simulating ${language} execution...`);
        const response = await aiService.simulateExecution(code, language);
        res.json({ success: true, ...response });
    } catch (error) {
        console.error("Controller Error (Execute):", error);
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message });
    }
}