import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [allRewrites, setAllRewrites] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            if (!auth.currentUser) {
                navigate("/");
                return;
            }
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                setIsAdmin(true);
                fetchData();
            } else {
                navigate("/dashboard");
            }
            setLoading(false);
        };
        checkAdmin();
    }, [navigate]);

    const fetchData = async () => {
        const usersSnap = await getDocs(collection(db, "users"));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const rewritesSnap = await getDocs(query(collection(db, "rewrites"), orderBy("createdAt", "desc")));
        setAllRewrites(rewritesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    if (loading) return <div style={{ color: "white", padding: "50px", textAlign: "center" }}>Checking Permissions...</div>;
    if (!isAdmin) return null;

    return (
        <div style={{ padding: "40px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
                <h1>Admin Panel</h1>
                <button onClick={() => navigate("/dashboard")} style={{ background: "#333" }}>Back to Dashboard</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px" }}>
                <section>
                    <h2>Registered Users ({users.length})</h2>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "12px" }}>
                        {users.map(u => (
                            <div key={u.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                <strong>{u.email}</strong> <br />
                                <small>Role: {u.role}</small>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2>Global AI Activity ({allRewrites.length})</h2>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "12px" }}>
                        {allRewrites.map(r => (
                            <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                <small style={{ color: "#6366f1" }}>User: {r.userId}</small>
                                <p style={{ margin: "5px 0", fontSize: "12px", color: "#aaa" }}>
                                    Code rewritten at: {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "Recent"}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
