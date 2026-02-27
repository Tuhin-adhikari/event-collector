import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            nav("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4">

            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Event Manager Login
                </h2>

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-semibold hover:opacity-90 transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}