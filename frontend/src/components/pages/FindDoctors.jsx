import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Star, Stethoscope, MapPin, X, Calendar, Check, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FindDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null); // For booking modal
    const [showModal, setShowModal] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Booking Form State
    const [bookingData, setBookingData] = useState({
        date: "",
        time: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-doctors`);
                const data = await res.json();
                if (res.ok) {
                    setDoctors(data.doctors);
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleMessage = (doctor) => {
        navigate('/messages', { state: { startChatWith: doctor } });
    };

    const [paymentStep, setPaymentStep] = useState(0); // 0: Booking Form, 1: Payment
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const openBookingModal = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
        setBookingSuccess(false);
        setPaymentStep(0); // Reset step
        setBookingData({ date: "", time: "" });
    };

    // Load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Proceed to Payment with Razorpay
    const handleProceedToPayment = async (e) => {
        e.preventDefault();
        if (!bookingData.date || !bookingData.time) return;

        const res = await loadRazorpay();
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        // 1. Create Order
        try {
            const orderRes = await fetch(`${import.meta.env.VITE_API_BASE}/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 2000, currency: 'INR' }) // Using INR for Razorpay India
            });
            const order = await orderRes.json();

            if (!orderRes.ok) {
                alert("Server error: " + order.message);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                amount: order.amount,
                currency: order.currency,
                name: "MediTrack",
                description: "Appointment Booking Fee",
                image: "https://your-logo-url.com/logo.png", // Optional
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE}/verify-payment`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok && verifyData.status === "success") {
                            await bookAppointment();
                        } else {
                            alert("Payment verification failed!");
                        }
                    } catch (error) {
                        console.error("Verification Error:", error);
                        alert("Payment successful but verification failed.");
                    }
                },
                prefill: {
                    name: localStorage.getItem("userName") || "Patient",
                    email: localStorage.getItem("userEmail") || "patient@example.com",
                    contact: "9999999999"
                },
                notes: {
                    address: "Razorpay Corporate Office"
                },
                theme: {
                    color: "#0891b2" // Cyan-600
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response) {
                alert(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Payment failed to initialize.");
        }
    };

    const bookAppointment = async () => {
        const currentUserEmail = localStorage.getItem("userEmail");
        const currentUserName = localStorage.getItem("userName");

        if (!currentUserEmail) {
            alert("Please login to book an appointment.");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/book-appointment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId: selectedDoctor.email,
                    patientId: currentUserEmail,
                    patientName: currentUserName || "Patient",
                    date: bookingData.date,
                    time: bookingData.time
                })
            });

            if (res.ok) {
                setBookingSuccess(true);
                // Auto close after 2 seconds
                setTimeout(() => {
                    setShowModal(false);
                    setBookingSuccess(false);
                }, 2000);
            } else {
                alert("Failed to book.");
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("Error booking appointment.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pt-24 relative">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 mb-2">
                    Find Doctors
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Connect with top specialists for your health needs.</p>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.length > 0 ? (
                            doctors.map((doctor, index) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                            {doctor.profilePic ? (
                                                <img src={doctor.profilePic} alt={doctor.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{doctor.name}</h3>
                                            <p className="text-cyan-600 font-medium text-sm flex items-center gap-1">
                                                <Stethoscope size={14} />
                                                {doctor.specialization || "General Physician"}
                                            </p>
                                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                {doctor.experience || 0} Years Experience
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={() => handleMessage(doctor)}
                                            className="flex-1 py-2 px-4 bg-cyan-50 text-cyan-600 rounded-xl font-semibold hover:bg-cyan-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare size={18} />
                                            Message
                                        </button>
                                        <button
                                            onClick={() => openBookingModal(doctor)}
                                            className="flex-1 py-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                        >
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-slate-400">
                                <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No doctors registered yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {showModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                        {bookingSuccess ? (
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Confirmed!</h3>
                                <p className="text-slate-600 dark:text-slate-300">Your appointment has been successfully scheduled.</p>
                            </div>
                        ) : (
                            // PAYMENT UI REMOVED - Using Razorpay Modal
                            // BOOKING FORM UI (Existing)
                            <>
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Book Appointment</h3>
                                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleProceedToPayment} className="p-6 space-y-4">
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                            {selectedDoctor.profilePic ? (
                                                <img src={selectedDoctor.profilePic} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} className="text-slate-400 m-auto mt-3" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{selectedDoctor.name}</p>
                                            <p className="text-sm text-cyan-600">{selectedDoctor.specialization}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                value={bookingData.date}
                                                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                                className="w-full pl-10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input
                                                type="time"
                                                required
                                                value={bookingData.time}
                                                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                                className="w-full pl-10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                handleMessage(selectedDoctor);
                                            }}
                                            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                                        >
                                            Chat First
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 px-4 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
                                        >
                                            Proceed to Pay
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FindDoctors;
