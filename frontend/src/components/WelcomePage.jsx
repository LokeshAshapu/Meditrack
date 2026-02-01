
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Hero3D from './Hero3D';
import { Activity, Pill, CalendarCheck, ShieldCheck } from 'lucide-react';

function WelcomePage() {
    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <section className="relative w-full h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-16 pt-20">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="md:w-1/2 z-20"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                            Smart Medical
                        </span>
                        <br />
                        <span className="text-slate-800 dark:text-slate-100">Tracking</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                        MediTrack helps you stay on top of your medication schedule, explore medical specialities, and manage your health journey with advanced 3D visualization.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-8 py-3 rounded-full bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2">
                            Get Started <i className="fa-solid fa-arrow-right-long"></i>
                        </Link>
                        <Link to="/about" className="px-8 py-3 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            Learn More
                        </Link>
                    </div>
                </motion.div>

                {/* 3D Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="md:w-1/2 h-[50vh] md:h-full w-full relative z-10"
                >
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <Hero3D />
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                    </Canvas>
                </motion.div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-20 px-6 md:px-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">Why Choose MediTrack?</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Comprehensive tools designed for patients, caregivers, and healthcare professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Pill size={32} className="text-cyan-500" />}
                            title="Medicine Tracker"
                            desc="Never miss a dose with our intelligent reminder system."
                        />
                        <FeatureCard
                            icon={<Activity size={32} className="text-blue-500" />}
                            title="Health Analytics"
                            desc="Visualize your progress and adherence over time."
                        />
                        <FeatureCard
                            icon={<CalendarCheck size={32} className="text-indigo-500" />}
                            title="Smart Scheduling"
                            desc="Customize frequency, specific days, and notification times."
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={32} className="text-teal-500" />}
                            title="Secure & Private"
                            desc="Your health data is encrypted and stored securely."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all"
        >
            <div className="mb-4 bg-slate-50 dark:bg-slate-700 w-14 h-14 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {desc}
            </p>
        </motion.div>
    )
}

export default WelcomePage;