import { useEffect, useState } from "react";

function History() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("history")) || [];
        setHistory(stored);
    }, []);

    return (
        <div className="history-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Your Past Activity</h2>

            {history.length === 0 ? (
                <p>No history found yet.</p>
            ) : (
                <div className="history-list" style={{ display: 'grid', gap: '20px' }}>
                    {history.map(item => (
                        <div key={item.id} className="card history-item" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <p><strong>{item.type.toUpperCase()}</strong></p>
                                <small style={{ opacity: 0.6 }}>{item.date}</small>
                            </div>
                            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '13px', color: '#e5e7eb' }}>{item.result}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default History;
