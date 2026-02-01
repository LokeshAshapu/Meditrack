import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Clock, Award, Star, Edit, Save, MapPin, Building } from 'lucide-react';

function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [streak, setStreak] = useState(0);

    // Form state for editing
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
        fetchStreak();
    }, []);

    const fetchProfile = async () => {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-user-profile?email=${email}`);
            const data = await res.json();
            if (res.ok) {
                setProfile(data.user);
                setFormData(data.user);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStreak = async () => {
        const email = localStorage.getItem("userEmail");
        if (!email) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-streak?email=${email}`);
            const data = await res.json();
            if (res.ok) setStreak(data.streak);
        } catch (error) {
            console.error("Error fetching streak:", error);
        }
    };

    const handleSave = async () => {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/update-profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, email })
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data.user); // Sync with backend response
                setFormData(data.user); // Ensure form is also synced (optional but good)
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                console.error("Failed to update profile", data.message);
                alert(`Failed to save: ${data.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pt-24">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
                    <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6">
                        <div className="w-32 h-32 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg">
                            <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                                {profile?.profilePic ? (
                                    <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-400" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile?.name || "Dr. User"}</h1>
                            <p className="text-cyan-600 font-medium flex items-center gap-2">
                                <Award size={16} /> {profile?.specialization || "General Physician"}
                            </p>
                        </div>
                        <div className="mb-4 flex gap-3">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                                        <Save size={18} /> Save Changes
                                    </button>
                                    <label className="cursor-pointer px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium flex items-center gap-2 transition-colors">
                                        <Edit size={18} /> Change Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, profilePic: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center gap-2 transition-colors">
                                    <Edit size={18} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Stats & Streak */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <Star className="text-yellow-400 fill-yellow-400" /> Daily Streak
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white">{streak}</span>
                                <span className="text-sm text-slate-500">Days Active</span>
                            </div>
                            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${Math.min(streak * 10, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Availability</h3>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.availability || "Mon - Fri: 09:00 - 17:00"}
                                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                                            placeholder="e.g. Mon-Fri: 9am-5pm"
                                        />
                                        <button
                                            onClick={handleSave}
                                            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                                            title="Save Schedule"
                                        >
                                            <Save size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Schedule</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{profile?.availability || "Mon - Fri: 09:00 - 17:00"}</span>
                                    </div>
                                )}
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="w-full py-2 text-cyan-600 text-sm font-medium hover:bg-cyan-50 dark:hover:bg-cyan-900/10 rounded-lg transition-colors">
                                        Manage Schedule
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal & Professional Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="email"
                                        value={formData.email || ""}
                                        disabled={true} // Email usually immutable
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.phoneNumber || ""}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500">Consulting Hospital</label>
                                <div className="relative">
                                    <Building size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.hospital || ""}
                                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500">Specialization</label>
                                <div className="relative">
                                    <Award size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.specialization || ""}
                                        disabled={true} // Hard to change spec without re-verification logic?
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-500">Experience (Years)</label>
                                <div className="relative">
                                    <Clock size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="number"
                                        value={formData.experience || 0}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorProfile;
