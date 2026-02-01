import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, Stethoscope, Briefcase, FileText, Upload, Building, UserPlus } from "lucide-react";

function SignupPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        role: "patient",
        specialization: "General",
        experienceLevel: "fresher",
        experience: 0,
        hospital: "",
        medicalIdCard: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        if (e.target.checked) {
            setFormData({ ...formData, role: 'doctor' });
        } else {
            setFormData({ ...formData, role: 'patient' });
        }
    };

    const handleExperienceLevelChange = (e) => {
        setFormData({
            ...formData,
            experienceLevel: e.target.value,
            experience: e.target.value === 'fresher' ? 0 : formData.experience
        });
    };

    const handleIdCardUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                setError("File is too large (Max 5MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, medicalIdCard: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                navigate("/login");
            } else {
                setError(data.message || "Signup failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 mb-2">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">Join Meditrack for better health management</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Toggle */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                            <input
                                type="checkbox"
                                id="doctorRole"
                                checked={formData.role === 'doctor'}
                                onChange={handleRoleChange}
                                className="w-5 h-5 text-cyan-500 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor="doctorRole" className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none cursor-pointer">
                                I am a Doctor / Medical Professional
                            </label>
                        </div>

                        {/* Standard Fields */}
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number (Required)"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Doctor Specific Fields */}
                        {formData.role === 'doctor' && (
                            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700 animate-fadeIn">
                                <p className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-2">Professional Details</p>

                                <div className="relative">
                                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <select
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white appearance-none"
                                    >
                                        <option value="General">General Physician</option>
                                        <option value="Cardiology">Cardiology</option>
                                        <option value="Dermatology">Dermatology</option>
                                        <option value="Neurology">Neurology</option>
                                        <option value="Orthopedics">Orthopedics</option>
                                        <option value="Pediatrics">Pediatrics</option>
                                        <option value="Psychiatry">Psychiatry</option>
                                    </select>
                                </div>

                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        name="hospital"
                                        placeholder="Consulting Hospital / Clinic"
                                        value={formData.hospital}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                        required
                                    />
                                </div>

                                {/* Experience Level */}
                                <div className="flex gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="experienceLevel"
                                            value="fresher"
                                            checked={formData.experienceLevel === 'fresher'}
                                            onChange={handleExperienceLevelChange}
                                            className="hidden peer"
                                        />
                                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center peer-checked:bg-cyan-50 peer-checked:border-cyan-500 peer-checked:text-cyan-700 dark:peer-checked:bg-cyan-900/30 dark:peer-checked:text-cyan-300 transition-all">
                                            <span className="text-sm font-semibold">Fresher</span>
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="experienceLevel"
                                            value="experienced"
                                            checked={formData.experienceLevel === 'experienced'}
                                            onChange={handleExperienceLevelChange}
                                            className="hidden peer"
                                        />
                                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center peer-checked:bg-cyan-50 peer-checked:border-cyan-500 peer-checked:text-cyan-700 dark:peer-checked:bg-cyan-900/30 dark:peer-checked:text-cyan-300 transition-all">
                                            <span className="text-sm font-semibold">Experienced</span>
                                        </div>
                                    </label>
                                </div>

                                {formData.experienceLevel === 'experienced' && (
                                    <div className="relative animate-fadeIn">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="number"
                                            name="experience"
                                            placeholder="Years of Experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                            min="0"
                                        />
                                    </div>
                                )}

                                {/* Medical ID Upload */}
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleIdCardUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        {formData.medicalIdCard ? (
                                            <div className="w-full h-32 relative">
                                                <img src={formData.medicalIdCard} alt="ID Preview" className="w-full h-full object-contain rounded-lg" />
                                                <p className="text-xs text-green-600 mt-1 font-bold">ID Uploaded Successfully</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400">
                                                    <FileText size={24} />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Medical License / ID Card</p>
                                                <p className="text-xs text-slate-500">Required for verification</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex justify-center items-center"
                        >
                            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-slate-900 dark:text-white font-bold hover:underline hover:text-blue-600 dark:hover:text-blue-400">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;