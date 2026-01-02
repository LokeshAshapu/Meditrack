import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import MedicalFooter from "../MedicalFooter";

function Dashboard() {
    const [message, setMessage] = useState("");
    const [cards, setCards] = useState([]);
    // const [ntfyTopic, setNtfyTopic] = useState(""); // <-- REMOVE THIS

    const email = localStorage.getItem("userEmail");

    useEffect(() => {
        const fetchCards = async () => {
            if (!email) {
                setMessage("Please log in to see your trackers.");
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-tracker?email=${email}`);
                const data = await res.json();
                if (res.ok) {
                    setCards(data.data);
                } else {
                    setMessage(data.message || "Error fetching trackers");
                    setCards([]);
                }
            } catch (error) {
                console.error("Error fetching cards:", error);
                setMessage("Failed to fetch trackers.");
                setCards([]);
            }
        };
        
        // --- REMOVE THE fetchUserData FUNCTION ---

        fetchCards();
        // --- REMOVE THE fetchUserData() CALL ---
    }, [email]);

    const handleDelete = async (id) => {
        // ... (this function remains the same)
         try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/delete-tracker/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                setMessage(data.message || "Something went wrong");
                return;
            }
            
            setCards(currentCards => currentCards.filter(card => card._id !== id));
            setMessage(data.message || "Tracker deleted successfully!");
            setTimeout(() => setMessage(""), 3000);

        } catch (error) {
            console.error("Error deleting tracker:", error);
            setMessage("Failed to delete tracker");
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return (
        <div className="bg-white min-h-screen">
        <NavBar />
        <div className="p-4 mt-6 mb-6 col-span-3">
            {message && (
                <div
                    className={`mt-4 ${message.includes("Failed") || message.includes("Error") ? "bg-red-100 border-red-300 text-red-800" : "bg-green-100 border-green-300 text-green-800"} border px-4 py-3 rounded text-center font-semibold`}
                    role="alert"
                >
                {message}
                </div>
            )}
        <h1 className="text-center mt-4 mb-15 font-bold text-3xl text-indigo-700">Welcome dear subscriber...</h1>
        
        {/* --- REMOVE THE NTFY JSX BLOCK --- */}

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md mb-24">
            <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
                Your Tracks
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.length > 0 ? (
                    cards.map((card) => (
                        <div
                            key={card._id}
                            className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-md transition"
                        >
                            <p>
                                <strong>Email:</strong> {card.email}
                            </p>
                            <p>
                                <strong>Medicine:</strong> {card.medicine}
                            </p>
                            <p>
                                <strong>Time:</strong> {card.time}
                            </p>
                            <button
                                onClick={() => handleDelete(card._id)}
                                className="bg-blue-700 p-2 text-white rounded-md cursor-pointer mt-3 hover:bg-indigo-800"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 col-span-3">
                        No trackers available.
                    </p>
                )}
                </div>
            </div>
        </div>
        <MedicalFooter />
    </div>
    );
}

export default Dashboard;