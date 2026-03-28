import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsub();
    }, []);

    if (user === undefined) return <div style={{ color: '#6366f1', textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>Loading CodeReviewer...</div>;
    if (!user) return <Navigate to="/" />;

    return children;
}
