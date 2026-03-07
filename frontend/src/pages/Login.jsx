import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-brand">
                <h1>CodeReview AI</h1>
            </div>

            <form className="auth-card" onSubmit={handleLogin}>
                <h2>Welcome Back 👋</h2>
                <p className="subtitle">Login to continue to CodeReview AI</p>

                {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "15px" }}>{error}</p>}

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="switch-text">
                    Don’t have an account?
                    <Link to="/signup"> Sign Up</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
