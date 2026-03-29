const rewriteService = require("../services/rewrite.service");

module.exports.rewriteCode = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, message: "Code is required" });
    }

    try {
        const result = await rewriteService(code);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Rewrite error:", error);
        const status = error.status || 500;
        
        res.status(status).json({
            success: false,
            message: error.message,
            provider: "Gemini"
        });
    }
};
