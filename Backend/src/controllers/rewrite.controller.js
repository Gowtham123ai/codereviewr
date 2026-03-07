const rewriteService = require("../services/rewrite.service");

module.exports.rewriteCode = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).send("Code is required");
    }

    try {
        const result = await rewriteService(code);
        res.json(result);
    } catch (error) {
        console.error("Rewrite error:", error);
        const status = error.status || 500;
        let message = "Rewrite failed. Please try again later.";

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
};
