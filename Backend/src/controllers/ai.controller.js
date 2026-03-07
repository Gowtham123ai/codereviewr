const aiService = require("../services/ai.service")


module.exports.getReview = async (req, res) => {
    const code = req.body.code;

    if (!code) {
        return res.status(400).send("Prompt is required");
    }

    try {
        const response = await aiService(code);
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