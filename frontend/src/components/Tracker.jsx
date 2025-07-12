import React, { useState} from "react";
import NavBar from "./NavBar";
import MedicalFooter from "./MedicalFooter";

function Tracker() {
    const [email, setEmail] = useState("");
    const [medicine, setMedicine] = useState("");
    const [time, setTime] = useState("");
    const [message, setMessage] = useState("");
    const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/add-tracker`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, medicine, time }),
    });

    const data = await res.json();

    if (!res.ok) {
        setMessage(data.message || "Something went wrong");
        return;
    }

    setMessage(data.message || "Subscribed successfully!");
    setEmail("");
    setMedicine("");
    setTime("");

    };

    return (
    <div className="bg-white min-h-screen">
        <NavBar />
        <div className="p-4 mt-6 mb-6 col-span-3">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
            Track to fill
        </h1>
        <div className="flex flex-col lg:flex-row items-center justify-around bg-yellow-50 p-6 rounded-lg shadow-md gap-8">
            <img
            src="/remainder.png"
            alt="tracker"
            className="rounded-md w-full md:w-2/3 lg:w-1/2"
            />
            <form
            onSubmit={handleSubmit}
            className="w-full md:w-4/5 lg:w-1/2 flex flex-col items-center bg-white p-6 rounded-lg shadow-md"
            >
            <div className="flex flex-col w-full mb-4">
                <label className="text-lg font-semibold mb-2">
                Enter your email to get updates:
                </label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter same email where you registered"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                required
                />
            </div>
            <div className="flex flex-col w-full mb-4">
                <label className="text-lg font-semibold mb-2">
                Medicine Name:
                </label>
                <input
                type="text"
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
                placeholder="Enter medicine name"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                required
                />
            </div>
            <div className="flex flex-col w-full mb-4">
                <label className="text-lg font-semibold mb-2">
                Time to take:
                </label>
                <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                required
                />
            </div>
            <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-full sm:w-auto cursor-pointer transition-colors duration-300"
            >
                Subscribe
            </button>
            {message && (
                <p className="mt-4 text-green-600 text-center font-semibold">
                {message}
                </p>
            )}
            </form>
        </div>
        </div>
        <MedicalFooter />
    </div>
    );
}

export default Tracker;
