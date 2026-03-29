const toolService = require("../services/tool.service");

module.exports.explainCode = async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
        const explanation = await toolService(code, "explain");
        res.json({ success: true, explanation });
    } catch (error) {
        console.error("Explain error:", error);
        res.status(error.status || 500).json({ success: false, message: "Explain failed" });
    }
};

module.exports.detectBugs = async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
        const bugs = await toolService(code, "detect-bugs");
        res.json({ success: true, bugs });
    } catch (error) {
        console.error("Bug detection error:", error);
        res.status(error.status || 500).json({ success: false, message: "Bug detection failed" });
    }
};
