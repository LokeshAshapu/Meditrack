import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import MedicalFooter from "./MedicalFooter";

function Tracker() {
  const [email, setEmail] = useState("");
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [cards, setCards] = useState([]);

  const fetchCards = async () => {
    try {
      const res = await fetch("http://localhost:5000/get-tracker");
      const data = await res.json();
      setCards(data.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/add-tracker", {
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

    fetchCards();
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
            src="src/assets/remainder.png"
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
                placeholder="Enter your email"
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-full sm:w-auto"
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
                  <button className="bg-blue-700  p-2 text-white rounded-md cursor-pointer mt-3 hover:bg-indigo-800">Delete</button>
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

export default Tracker;
