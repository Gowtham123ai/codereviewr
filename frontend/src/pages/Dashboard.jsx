import { useState, useEffect } from 'react'
import Tools from './Tools'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import axios from 'axios'
import '../App.css'
import { signOut } from "firebase/auth"
import { auth, db } from "../firebase"
import { useNavigate } from "react-router-dom"
import { query, where, getDocs, collection, orderBy } from "firebase/firestore"
import { diffLines } from "diff"
import History from "./History"

export default function Dashboard({ darkMode, setDarkMode }) {
    const [code, setCode] = useState(`function sum() {
  return 1 + 1
}`);
    const [result, setResult] = useState(null)
    const [explanation, setExplanation] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('review') // 'review', 'rewrite', or 'history'
    const [history, setHistory] = useState([])
    const [fileName, setFileName] = useState("index.js")
    const [language, setLanguage] = useState("javascript")
    const [usageCount, setUsageCount] = useState(0)
    const [mode, setMode] = useState("review")
    const navigate = useNavigate()

    const fetchHistory = () => {
        const stored = JSON.parse(localStorage.getItem("history")) || [];
        setHistory(stored);
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const saveToHistory = (type, result) => {
        const existing = JSON.parse(localStorage.getItem("history")) || [];
        const newEntry = {
            id: Date.now(),
            type,
            code,
            result,
            date: new Date().toLocaleString(),
        };
        const updated = [newEntry, ...existing];
        localStorage.setItem("history", JSON.stringify(updated));
    };

    const handleAction = async (type) => {
        if (!code.trim()) return;

        setIsLoading(true);
        setError(null);
        setMode(type);

        const endpoint = type === "rewrite"
            ? `${import.meta.env.VITE_API_URL}/api/rewrite`
            : `${import.meta.env.VITE_API_URL}/ai/get-review`;

        try {
            const response = await axios.post(endpoint, { code, language });
            const data = response.data;

            if (type === "rewrite") {
                const rewrittenCode = data.rewrittenCode || data.improvedCode;
                setResult(rewrittenCode);
                setExplanation(data.explanation);
                saveToHistory("rewrite", rewrittenCode);
            } else {
                setResult(data.review);
                setExplanation(data.explanation);
                saveToHistory("review", data.review);
            }

            setUsageCount(prev => prev + 1);
        } catch (err) {
            console.error(`[Dashboard] ${type} error:`, err);
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderDiff = () => {
        if (mode !== 'rewrite' || !result || typeof result !== 'string') return null;
        try {
            const differences = diffLines(code, result);

            return differences.map((part, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: part.added ? "rgba(20, 83, 45, 0.4)" : part.removed ? "rgba(127, 29, 29, 0.4)" : "transparent",
                        color: part.added ? "#4ade80" : part.removed ? "#f87171" : "inherit",
                        padding: '0 8px',
                        borderLeft: part.added ? '4px solid #22c55e' : part.removed ? '4px solid #ef4444' : '4px solid transparent',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                    }}
                >
                    {part.value}
                </div>
            ));
        } catch (err) {
            console.error("Diff error:", err);
            return <pre>{result}</pre>;
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div className={`dashboard-layout ${darkMode ? "dark" : "light"}`}>
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>CodeReview AI</h3>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        className={`sidebar-btn ${activeTab === 'review' ? 'active' : ''}`}
                        onClick={() => setActiveTab('review')}
                    >
                        Editor
                    </button>
                    <button
                        className={`sidebar-btn ${activeTab === 'rewrite' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rewrite')}
                    >
                        Tools
                    </button>
                    <button
                        className={`sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>

                <div className="usage-panel">
                    <p>Daily Usage</p>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(usageCount / 10) * 100}%` }}
                        />
                    </div>
                    <span>{usageCount} / 10 queries used</span>
                </div>

                <div className="sidebar-footer">
                    <button
                        className="sidebar-btn"
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </button>
                    <button
                        className="sidebar-btn"
                        onClick={handleLogout}
                        style={{ color: '#ef4444' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="main">
                    {error && (
                        <div className="error-box" style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {activeTab === 'review' ? (
                        <>
                            <div className="editor-panel">
                                <div className="editor-toolbar">
                                    <div className="file-section">
                                        <input
                                            className="file-input"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            placeholder="index.js"
                                        />

                                        <select
                                            className="language-select"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                        </select>
                                    </div>

                                    <div className="action-buttons">
                                        <button
                                            className={`btn-review ${mode === "review" ? "active-btn" : ""}`}
                                            onClick={() => handleAction("review")}
                                            disabled={isLoading}
                                        >
                                            {isLoading && mode === 'review' ? '⚡ ...' : '⚡ Review'}
                                        </button>

                                        <button
                                            className={`btn-rewrite ${mode === "rewrite" ? "active-btn" : ""}`}
                                            onClick={() => handleAction("rewrite")}
                                            disabled={isLoading}
                                        >
                                            {isLoading && mode === 'rewrite' ? '✨ ...' : '✨ Rewrite'}
                                        </button>
                                    </div>

                                    <div className="usage-pill">
                                        {usageCount} / 10
                                    </div>
                                </div>

                                <CodeMirror
                                    value={code}
                                    height="100%"
                                    extensions={[javascript()]}
                                    theme={oneDark}
                                    onChange={(value) => setCode(value)}
                                    basicSetup={{
                                        lineNumbers: true,
                                        highlightActiveLine: true,
                                        highlightSelectionMatches: true,
                                        autocompletion: true,
                                        foldGutter: true,
                                        bracketMatching: true,
                                        closeBrackets: true,
                                    }}
                                />
                            </div>

                            <div className="output-panel">
                                {isLoading ? (
                                    <div className="loading-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <p>AI is processing your code...</p>
                                    </div>
                                ) : result ? (
                                    <div className="analysis-output">
                                        {mode === 'rewrite' ? (
                                            <div className="diff-view">
                                                <h4 style={{ marginBottom: '15px', opacity: 0.8 }}>Improvement Diff</h4>
                                                <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', fontSize: '13px', border: '1px solid #1f2937' }}>
                                                    {renderDiff()}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="markdown-content">
                                                <Markdown rehypePlugins={[rehypeHighlight]}>{result}</Markdown>
                                            </div>
                                        )}

                                        {explanation && (
                                            <div className="ai-explanation">
                                                <h3>🧠 AI Explanation</h3>
                                                <p>{explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="placeholder" style={{ textAlign: 'center', marginTop: '100px', opacity: 0.6 }}>
                                        <h3>Analyze & Improve</h3>
                                        <p>Select a file above and click Review or Rewrite.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : activeTab === 'rewrite' ? (
                        <div className="page-content" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <Tools />
                        </div>
                    ) : (
                        <div className="page-content" style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                            <History />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
