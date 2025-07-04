import { response } from "express";
import React from "react";

function SignupPage() {
    const handleSubmit = (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;
        const confirmPassword = event.target.confirm_password.value;

        if (password !== confirmPassword) {
            alert("Please enter matching passwords.");
            return;
        }

        fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Signup successful!");
                response.redirect("/main");
            } else {
                alert(data.message || "Signup failed.");
            }
        })
        .catch((error) => {
            alert("An error occurred. Please try again.");
            console.error(error);
        });

        console.log("Signup form submitted");
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirm_password">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm_password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-200 cursor-pointer"
                    >
                        Sign Up
                    </button>
                    <p className="text-gray-500 mt-3">If already has an account <a href="/login" className="text-black hover:underline hover:text-blue-600">SignIn</a></p>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;