import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-brand">
                <h1>CodeReview AI</h1>
            </div>

            <form className="auth-card" onSubmit={handleSignup}>
                <h2>Create Account 🚀</h2>
                <p className="subtitle">Join CodeReview AI today</p>

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
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p className="switch-text">
                    Already have an account?
                    <Link to="/"> Login</Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;
