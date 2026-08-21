import React from "react";
import { useNavigate } from "react-router-dom";
import { requestPermissionAndToken } from "../firebase";

function LoginPage() {
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const email = event.target.email.value;
        const password = event.target.password.value;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful");
                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userName", data.user.name || "");
                localStorage.setItem("userPhone", data.user.phoneNumber || "");
                localStorage.setItem("userRole", data.user.role || "patient");

                // --- FIX ---
                // Wait for the token registration to try
                await requestPermissionAndToken();
                // --- END OF FIX ---

                if (data.user.role === 'doctor') {
                    navigate("/doctor-dashboard");
                } else if (data.user.role === 'admin') {
                    navigate("/admin");
                } else {
                    navigate("/main");
                }
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
                <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 cursor-pointer"
                    >
                        Sign In
                    </button>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-center">
                        If not already registered,{" "}
                        <a href="/signup" className="text-slate-900 dark:text-white font-semibold hover:underline hover:text-blue-600 dark:hover:text-blue-400">Sign Up</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;