import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import MedicalFooter from "../MedicalFooter";

function Dashboard() {
    const [message, setMessage] = useState("");
    const [cards, setCards] = useState([]);

    const email = localStorage.getItem("userEmail");

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await fetch(`http://localhost:5000/get-tracker?email=${email}`);
                const data = await res.json();
                setCards(data.data);
            } catch (error) {
                console.error("Error fetching cards:", error);
                setCards([]);
            }
        };
        fetchCards();
    }, [email]);

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/delete-tracker/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.message || "Something went wrong");
                return;
            }
            window.alert(data.message || "Tracker deleted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting tracker:", error);
            setMessage("Failed to delete tracker");
        }
    };

    return (
        <div className="bg-white min-h-screen">
        <NavBar />
        <div className="p-4 mt-6 mb-6 col-span-3">
            {message && (
                <div
                    className="mt-4 text-green-800 bg-green-100 border border-green-300 px-4 py-3 rounded text-center font-semibold"
                    role="alert"
                >
                {message}
                </div>
            )}
        <h1 className="text-center mb-10 font-bold text-3xl text-indigo-700">Welcome to your Dashboard dear subscriber...</h1>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
                Your Tracks
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.length > 0 ? (
                    cards.map((card, index) => (
                        <div
                            key={index}
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
