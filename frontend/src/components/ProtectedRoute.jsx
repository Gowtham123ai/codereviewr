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

    if (user === undefined) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    if (!user) return <Navigate to="/" />;

    return children;
}
