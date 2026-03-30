import { useState } from "react";
import axios from "axios";

export default function Tools() {
    const [code, setCode] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callTool = async (type) => {
        if (!code.trim()) return;

        setLoading(true);
        setResult("");
        setError(null);

        const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
        const endpoint =
            type === "explain"
                ? `${baseUrl}/api/tools/explain`
                : `${baseUrl}/api/tools/detect-bugs`;

        try {
            const res = await axios.post(endpoint, { code });
            const data = res.data;

            if (type === "explain") {
                setResult(data.explanation);
            } else {
                setResult(data.bugs);
            }
        } catch (err) {
            console.error(err);
            const detailMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            setError(`AI Service: ${detailMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tools-page">
            <div className="tools-header">
                <h2>🧠 AI Developer Tools</h2>
                <p>Quickly analyze code blocks for deep understanding or bug detection.</p>
            </div>

            <div className="tools-container">
                <textarea
                    placeholder="Paste your code snippet here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <div className="tool-buttons">
                    <button
                        className="primary-btn tool-btn"
                        onClick={() => callTool("explain")}
                        disabled={loading}
                    >
                        {loading && result === "" ? "🧠 Thinking..." : "🧠 Explain Code"}
                    </button>

                    <button
                        className="primary-btn tool-btn bug-btn"
                        onClick={() => callTool("detect-bugs")}
                        disabled={loading}
                    >
                        {loading && result === "" ? "🐛 Tracking..." : "🐛 Detect Bugs"}
                    </button>
                </div>

                {error && (
                    <div className="error-box" style={{ margin: '20px 0' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {loading && !result && (
                    <div className="tool-loading">
                        <div className="spinner"></div>
                        <p>AI is analyzing your code logic...</p>
                    </div>
                )}

                {result && (
                    <div className="tool-result-scroll">
                        <div className="tool-result">
                            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{result}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
