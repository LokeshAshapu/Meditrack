import React, { useState, useEffect } from "react";
import { Phone, MessageCircle, Mail } from 'lucide-react';
import { authFetch } from '../utils/api';

function Tracker() {
    const [email, setEmail] = useState("");
    const [medicine, setMedicine] = useState("");
    const [time, setTime] = useState("");
    const [frequency, setFrequency] = useState("Daily");
    const [selectedDays, setSelectedDays] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [message, setMessage] = useState("");

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handleDayChange = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (frequency === "Specific Days" && selectedDays.length === 0) {
            setMessage("Please select at least one day.");
            return;
        }

        try {
            const res = await authFetch('/add-tracker', {
                method: "POST",
                body: JSON.stringify({ medicine, time, frequency, selectedDays, startDate, endDate }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Something went wrong");
            } else {
                setMessage(data.message || "Subscribed successfully!");
                // Clear fields on success
                setMedicine("");
                setTime("");
                setFrequency("Daily");
                setSelectedDays([]);
                setStartDate("");
                setEndDate("");
            }
        } catch (error) {
            console.error("Error adding tracker:", error);
            setMessage("An error occurred. Please try again.");
        }
    };

    // Fixed: Clear the message after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage("");
            }, 3000);
            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [message]);

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                    Track to Fill
                </h1>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Voice Calls</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Instant SOS calls to your registered number if you miss a dose.</p>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">SMS Alerts</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Timely text reminders sent directly to your phone so you never forget.</p>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Email Reports</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Get detailed adherence reports sent weekly to your inbox.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                    {/* Image Section - Visible on all screens, matches height of form on desktop */}
                    <div className="w-full h-64 md:h-auto md:min-h-full relative">
                        <img
                            src="/remainder.png"
                            alt="tracker"
                            className="rounded-2xl shadow-2xl w-full h-full object-cover border border-white/20 absolute inset-0 md:static"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">New Reminder</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    Registered Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                    required
                                    readOnly
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    Medicine Name
                                </label>
                                <input
                                    type="text"
                                    value={medicine}
                                    onChange={(e) => setMedicine(e.target.value)}
                                    placeholder="e.g. Aspirin"
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Frequency</label>
                                    <select
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Specific Days">Specific Days</option>
                                    </select>
                                </div>
                            </div>

                            {frequency === "Specific Days" && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold mb-3 text-slate-600 dark:text-slate-300">Select Days:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {daysOfWeek.map(day => (
                                            <label key={day} className="flex items-center space-x-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedDays.includes(day) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-400 bg-white'}`}>
                                                    {selectedDays.includes(day) && <span className="text-white text-xs">✓</span>}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDays.includes(day)}
                                                    onChange={() => handleDayChange(day)}
                                                    className="hidden"
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{day.slice(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                            >
                                Set Reminder
                            </button>

                            {message && (
                                <div className={`p-4 rounded-xl text-center font-medium ${message.includes("Failed") || message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    {message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tracker;