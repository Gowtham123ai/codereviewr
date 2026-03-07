import React, { useState } from "react";
import { diffLines } from "diff";
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function CodeEditor() {
    const [code, setCode] = useState("function init() {\n  console.log('hello world');\n}");
    const [improvedCode, setImprovedCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [usageCount, setUsageCount] = useState(0);

    const checkUsageLimit = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, "rewrites"),
            where("userId", "==", auth.currentUser.uid),
            where("createdAt", ">=", today)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    };

    const handleRewrite = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentUsage = await checkUsageLimit();
            if (currentUsage >= 10) {
                setError("Daily limit reached (10 rewrites). Please try again tomorrow.");
                setLoading(false);
                return;
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/rewrite`, { code });
            const result = response.data.improvedCode;
            setImprovedCode(result);

            // Save to Firestore History
            await addDoc(collection(db, "rewrites"), {
                userId: auth.currentUser.uid,
                originalCode: code,
                improvedCode: result,
                createdAt: serverTimestamp()
            });

        } catch (err) {
            console.error("Rewrite error:", err);
            const message = err.response?.data?.message || "Something went wrong. Please try again later.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = () => {
        const title = prompt("Enter filename (without extension):", "improved-code");
        if (!title) return;
        const blob = new Blob([improvedCode], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${title}.js`;
        link.click();
    };

    const acceptChanges = () => {
        setCode(improvedCode);
        setImprovedCode("");
    };

    const renderDiff = () => {
        const differences = diffLines(code, improvedCode);
        return differences.map((part, index) => {
            return (
                <span
                    key={index}
                    style={{
                        backgroundColor: part.added
                            ? "rgba(0, 255, 0, 0.2)"
                            : part.removed
                                ? "rgba(255, 0, 0, 0.2)"
                                : "transparent",
                        color: part.added ? "#98c379" : part.removed ? "#e06c75" : "inherit",
                        display: 'block',
                        padding: '2px 4px'
                    }}
                >
                    {part.value}
                </span>
            );
        });
    };

    return (
        <div className="code-rewriter" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>AI Code Rewriter</h2>

            {error && (
                <div className="error-box">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="editor-container" style={{ border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' }}>
                <CodeMirror
                    value={code}
                    height="300px"
                    extensions={[javascript()]}
                    theme={oneDark}
                    onChange={(value) => setCode(value)}
                />
            </div>

            {improvedCode && (
                <div className="editor-container" style={{ border: '1px solid #444', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
                    <div className="improved-code-container">
                        <CodeMirror
                            value={improvedCode}
                            height="100%"
                            extensions={[javascript()]}
                            theme={oneDark}
                            readOnly={true}
                        />
                        <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={downloadFile} style={{ background: '#10b981', padding: '8px 15px' }}>
                                💾 Download File
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleRewrite}
                    className={`rewrite-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? "Rewriting..." : "✨ Rewrite Code"}
                </button>

                {improvedCode && (
                    <button
                        onClick={acceptChanges}
                        className="review-btn"
                        style={{ width: 'auto', padding: '10px 20px', background: '#4d78cc' }}
                    >
                        Accept Changes
                    </button>
                )}
            </div>

            {improvedCode && (
                <div style={{ display: "flex", marginTop: '20px', gap: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <div style={{ flex: 1, padding: '10px', background: '#1e1e1e', borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Current Code</h3>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{code}</pre>
                    </div>

                    <div style={{ flex: 1, padding: '10px', background: '#1e1e1e', borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Improvements (Diff)</h3>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{renderDiff()}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
