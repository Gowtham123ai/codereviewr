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
import { Layout, History as HistoryIcon, Sparkles, Play, ShieldCheck, Zap, LineChart, CheckSquare, FileCode, ChevronDown, Brain, Search } from 'lucide-react'
import History from "./History"

export default function Dashboard({ darkMode, setDarkMode }) {
    console.log("[Dashboard] Rendering initialized with darkMode:", darkMode);
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
    const [version] = useState("v1.5.0-STABLE");
    const [score, setScore] = useState(0)
    const [currentChallenge, setCurrentChallenge] = useState(null)
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

    const handleRunCode = async () => {
        setIsLoading(true);
        setError(null);
        setMode("run");
        
        if (language === 'javascript') {
            // Stable JS runner for local execution
            setTimeout(() => {
                try {
                    const logCapture = [];
                    const mockConsole = {
                        log: (...args) => logCapture.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
                    };
                    
                    const runFunc = new Function('console', 'codeContents', 'try { eval(codeContents); } catch(e) { console.log("Error: " + e.message); }');
                    runFunc(mockConsole, code);
                    
                    const outputText = logCapture.length > 0 
                        ? logCapture.join('\n') 
                        : "Code executed successfully. (No output to console)";
                        
                    setResult(outputText);
                    setExplanation("Code was executed in your local browser sandbox.");
                    setScore(100);
                    saveToHistory("run", outputText);
                } catch (err) {
                    setResult(`Execution Failed: ${err.message}`);
                    setError(`Execution error: ${err.message}`);
                    setScore(0);
                } finally {
                    setIsLoading(false);
                }
            }, 800);
        } else {
            // AI-Powered Simulation for Java, Python, etc.
            const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
            try {
                const response = await axios.post(`${baseUrl}/ai/execute`, { code, language });
                setResult(response.data.output);
                setExplanation(response.data.explanation || `Simulated ${language} execution using AI.`);
                setScore(100);
                saveToHistory("run", response.data.output);
            } catch (err) {
                console.error("[Dashboard] Execution error:", err);
                setError("AI failed to simulate code execution. Please try again.");
                setResult("Execution Error");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAction = async (type, forcedCode = null) => {
        const targetCode = forcedCode || code;
        if (!targetCode?.trim()) return;
        
        // Reset results first to prevent "Ghost Results" from previous clicks
        setResult(null);
        setExplanation(null);
        setError(null);
        setScore(0);
        setIsLoading(true);
        setMode(type);

        if (type === "run") {
            handleRunCode();
            return;
        }

        const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, ""); 
        const endpoint = type === "rewrite"
            ? `${baseUrl}/api/rewrite`
            : `${baseUrl}/ai/get-review`;

        try {
            const response = await axios.post(endpoint, { code: targetCode, language });
            const data = response.data;
            
            if (!data.success) {
                setError(data.message || "AI service failed");
                return;
            }

            if (type === "rewrite") {
                const rewrittenCode = data.rewrittenCode || data.improvedCode;
                setResult(rewrittenCode);
                setExplanation(data.explanation);
                saveToHistory("rewrite", rewrittenCode);
            } else {
                setResult(data.review);
                setExplanation(data.explanation);
                setScore(parseInt(data.score) || 0);
                saveToHistory("review", data.review);
            }

            setUsageCount(prev => prev + 1);
        } catch (err) {
            console.error(`[Dashboard] ${type} error:`, err);
            const detailMsg = err.response?.data?.message || err.response?.data || err.message;
            setError(`AI Service: ${detailMsg}`);
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

                <div className="sidebar-nav" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <button
                        className={`sidebar-btn ${activeTab === 'review' ? 'active' : ''}`}
                        onClick={() => setActiveTab('review')}
                    >
                        <Layout size={18} />
                        <span>Editor</span>
                    </button>
                    <button
                        className={`sidebar-btn ${activeTab === 'rewrite' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rewrite')}
                    >
                        <Zap size={18} />
                        <span>AI Tools</span>
                    </button>
                    <button
                        className={`sidebar-btn ${activeTab === 'test' ? 'active' : ''}`}
                        onClick={() => setActiveTab('test')}
                    >
                        <CheckSquare size={18} />
                        <span>Coding Test</span>
                    </button>
                    <button
                        className={`sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <HistoryIcon size={18} />
                        <span>History</span>
                    </button>
                </div>

                <div className="usage-panel" style={{ padding: '20px 0 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontSize: '10px', fontWeight: '800', color: '#3b82f6', letterSpacing: '0.05em', margin: 0 }}>USAGE</p>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b' }}>{usageCount} / 10</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                        <div
                            className="progress-fill"
                            style={{ width: `${(usageCount / 10) * 100}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }}
                        />
                    </div>
                    <button className="upgrade-btn" style={{
                        background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%',
                        textTransform: 'uppercase'
                    }}>
                        <Sparkles size={14} fill="white" />
                        <span>UPGRADE</span>
                    </button>
                </div>

                <div className="sidebar-footer" style={{ borderTop: '1px solid #e2e8f0', marginTop: '10px', paddingTop: '10px' }}>
                    <button
                        className="sidebar-btn"
                        onClick={() => setDarkMode(!darkMode)}
                        style={{ width: '100%' }}
                    >
                        <Zap size={16} />
                        <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
                    </button>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="main">
                    {error && (
                        <div className="error-box" style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                            <span style={{ fontSize: '10px', verticalAlign: 'middle', marginRight: '8px', opacity: 0.7 }}>v1.0.8-PURE</span>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {activeTab === 'review' ? (
                        <>
                            <div className="editor-panel">
                                <div className="editor-toolbar">
                                    <div className="file-section">
                                        <div className="file-pill">
                                            <FileCode size={14} />
                                            <input
                                                className="file-pill-input"
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                            />
                                        </div>

                                        <div className="lang-pill">
                                            <div className="lang-badge">JS</div>
                                            <select
                                                className="lang-pill-select"
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                            >
                                                <option value="javascript">JavaScript</option>
                                                <option value="python">Python</option>
                                                <option value="java">Java</option>
                                            </select>
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <button
                                            className="btn-run action-btn"
                                            onClick={() => handleAction("run")}
                                            disabled={isLoading}
                                        >
                                            <Play size={16} fill="currentColor" />
                                            <span>Run Code</span>
                                        </button>

                                        <button
                                            className={`btn-review action-btn ${mode === "review" ? "active-btn" : ""}`}
                                            onClick={() => handleAction("review")}
                                            disabled={isLoading}
                                        >
                                            <ShieldCheck size={16} />
                                            <span>{isLoading && mode === 'review' ? 'Analyzing...' : 'Check Quality'}</span>
                                        </button>

                                        <button
                                            className={`btn-rewrite action-btn ${mode === "rewrite" ? "active-btn" : ""}`}
                                            onClick={() => handleAction("rewrite")}
                                            disabled={isLoading}
                                        >
                                            <Sparkles size={16} />
                                            <span>{isLoading && mode === 'rewrite' ? 'Rewriting...' : 'Rewrite AI'}</span>
                                        </button>
                                    </div>
                                </div>

                                <CodeMirror
                                    value={code}
                                    height="100%"
                                    extensions={[javascript()]}
                                    theme={darkMode ? oneDark : 'light'}
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
                                    <div className="loading-state">
                                        <div className="spinner"></div>
                                        <p>AI is processing your code...</p>
                                    </div>
                                ) : result ? (
                                    <div className="analysis-output">
                                        {/* 1. Quality Bar (Check Quality mode only) */}
                                        {mode === 'review' && (
                                            <div className="quality-card animated fadeIn">
                                                <div className="quality-header">
                                                    <div className="quality-title">
                                                        <LineChart size={18} />
                                                        <span>Code Quality Status</span>
                                                    </div>
                                                    <span className="quality-value">{score}%</span>
                                                </div>
                                                <div className="quality-progress-track">
                                                    <div
                                                        className="quality-progress-fill"
                                                        style={{
                                                            width: `${score}%`,
                                                            backgroundColor: score > 80 ? '#22c55e' : score > 50 ? '#eab308' : '#ef4444'
                                                        }}
                                                    />
                                                </div>
                                                <p className="quality-note text-secondary">
                                                    {score > 80 ? 'Excellent! Code follows best practices.' : 'Quality improved, check findings below.'}
                                                </p>
                                            </div>
                                        )}

                                        {/* 2. Primary Output/Review/Diff Section */}
                                        <div className="markdown-content animated slideUp">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#6366f1' }}>
                                                {mode === 'run' ? <Play size={18} /> : mode === 'rewrite' ? <Sparkles size={18} /> : <Search size={18} />}
                                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                                                    {mode === 'run' ? 'Console Output' : mode === 'rewrite' ? 'Improvement Diff' : 'Review Findings'}
                                                </h3>
                                            </div>
                                            
                                            {mode === 'rewrite' ? (
                                                <div className="diff-container" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                                                    {renderDiff()}
                                                </div>
                                            ) : (
                                                <div className="result-text" style={{ 
                                                    background: mode === 'run' ? '#0f172a' : 'transparent',
                                                    color: mode === 'run' ? '#f8fafc' : 'inherit',
                                                    padding: mode === 'run' ? '15px' : '0',
                                                    borderRadius: '8px',
                                                    fontFamily: mode === 'run' ? 'monospace' : 'inherit',
                                                    minHeight: mode === 'run' ? '60px' : 'auto'
                                                }}>
                                                    <Markdown rehypePlugins={[rehypeHighlight]}>{result}</Markdown>
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. AI Explanation (All modes) */}
                                        {explanation && (
                                            <div className="ai-explanation animated fadeIn">
                                                <div className="explanation-header">
                                                    <Brain size={18} className="brain-icon" />
                                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI Explanation</h3>
                                                </div>
                                                <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>{explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="placeholder-container">
                                        <div className="placeholder-graphic">
                                            <Sparkles size={48} className="placeholder-sparkle" />
                                        </div>
                                        <h3 className="placeholder-title">Analyze & Improve</h3>
                                        <p className="placeholder-text text-secondary">
                                            Click <b>Check Quality</b> or <b>Rewrite AI</b> to get started with your code review.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : activeTab === 'rewrite' ? (
                        <div className="page-content" style={{ width: '100%', height: '100%' }}>
                            <Tools />
                        </div>
                    ) : activeTab === 'test' ? (
                        <div className="page-content" style={{ width: '100%', height: '100%', padding: currentChallenge ? '20px' : '40px', color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                            {!currentChallenge ? (
                                <div className="test-card" style={{ background: darkMode ? '#111827' : '#ffffff', padding: '30px', borderRadius: '16px', border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                    <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#6366f1' }}>Coding Challenges</h1>
                                    <p style={{ opacity: 0.7, marginBottom: '24px' }}>Test your skills with our curated algorithmic challenges.</p>
                                    
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {/* Challenge 1 */}
                                        <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '20px', borderRadius: '12px', border: darkMode ? 'none' : '1px solid #e2e8f0' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Sum of Two Numbers</h3>
                                            <p style={{ fontSize: '14px', marginBottom: '15px', opacity: 0.8 }}>Write a function <code>sum(a, b)</code> that returns the sum of two integers.</p>
                                            <button 
                                                className="btn-run action-btn" 
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
                                                onClick={() => {
                                                    const codeStr = 'function sum(a, b) {\n  // Your code here\n}\n\nconsole.log(sum(5, 10));';
                                                    setCurrentChallenge({ title: 'Sum of Two Numbers', code: codeStr });
                                                    setResult(null);
                                                    setScore(0);
                                                    setExplanation(null);
                                                }}
                                            >Start Challenge</button>
                                        </div>

                                        {/* Challenge 2 */}
                                        <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '20px', borderRadius: '12px', border: darkMode ? 'none' : '1px solid #e2e8f0' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>2. Reverse a String</h3>
                                            <p style={{ fontSize: '14px', marginBottom: '15px', opacity: 0.8 }}>Write a function <code>reverse(str)</code> that reverses the given string.</p>
                                            <button 
                                                className="btn-run action-btn" 
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
                                                onClick={() => {
                                                    const codeStr = 'function reverse(str) {\n  // Your code here\n}\n\nconsole.log(reverse("CodeGenie"));';
                                                    setCurrentChallenge({ title: 'Reverse a String', code: codeStr });
                                                    setResult(null);
                                                    setScore(0);
                                                    setExplanation(null);
                                                }}
                                            >Start Challenge</button>
                                        </div>

                                        {/* Challenge 3 */}
                                        <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '20px', borderRadius: '12px', border: darkMode ? 'none' : '1px solid #e2e8f0' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>3. Palindrome Check</h3>
                                            <p style={{ fontSize: '14px', marginBottom: '15px', opacity: 0.8 }}>Check if a string is a palindrome (reads the same forward and backward).</p>
                                            <button 
                                                className="btn-run action-btn" 
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
                                                onClick={() => {
                                                    const codeStr = 'function isPalindrome(str) {\n  // Your code here\n}\n\nconsole.log(isPalindrome("Racecar"));';
                                                    setCurrentChallenge({ title: 'Palindrome Check', code: codeStr });
                                                    setResult(null);
                                                    setScore(0);
                                                    setExplanation(null);
                                                }}
                                            >Start Challenge</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="active-test-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => setCurrentChallenge(null)}
                                            style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            ← Back to Challenges
                                        </button>
                                        <h2 style={{ margin: 0, fontSize: '20px' }}>{currentChallenge.title}</h2>
                                        <div style={{ width: '100px' }}></div>
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', gap: '20px' }}>
                                        <div style={{ flex: 1.2, background: '#111827', borderRadius: '16px', border: '1px solid #1f2937', overflow: 'hidden' }}>
                                            <CodeMirror
                                                value={currentChallenge.code}
                                                height="100%"
                                                extensions={[javascript()]}
                                                theme={oneDark}
                                                onChange={(value) => setCurrentChallenge({ ...currentChallenge, code: value })}
                                                basicSetup={{ lineNumbers: true }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <button 
                                                className="btn-review action-btn"
                                                onClick={() => handleAction("review", currentChallenge.code)}
                                                disabled={isLoading}
                                                style={{ width: '100%', padding: '15px', fontSize: '14px' }}
                                            >
                                                {isLoading ? 'Calculating Score...' : '🚀 Submit Code & Get Score'}
                                            </button>

                                            {score > 0 && (
                                                <div className="quality-card animated fadeIn">
                                                    <div className="quality-header">
                                                        <span>Scoring Result</span>
                                                        <span className="quality-value">{score}%</span>
                                                    </div>
                                                    <div className="quality-progress-track">
                                                        <div 
                                                            className="quality-progress-fill" 
                                                            style={{ width: `${score}%`, backgroundColor: score > 80 ? '#22c55e' : '#eab308' }}
                                                        />
                                                    </div>
                                                    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', fontSize: '13px' }}>
                                                        {explanation}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
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
