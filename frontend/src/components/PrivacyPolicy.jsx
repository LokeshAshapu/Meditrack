import React from 'react';
import { Shield, Lock, Eye, Database } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Your privacy is our priority. We are committed to protecting your personal health information.
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-white/20 space-y-10 text-slate-700 dark:text-slate-300">

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                            <Database className="text-cyan-500" />
                            1. Information We Collect
                        </h2>
                        <p className="leading-relaxed mb-4">
                            We collect information you provide directly to us, such as when you create an account, update your profile, or use our medication tracking features. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
                            <li>Personal identifiers (Name, Email, Phone Number).</li>
                            <li>Health data (Medications, Schedules, Adherence logs).</li>
                            <li>Device information (for push notifications).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                            <Eye className="text-cyan-500" />
                            2. How We Use Your Information
                        </h2>
                        <p className="leading-relaxed">
                            We use the information we collect to operate, maintain, and improve our services, such as:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-cyan-500">
                            <li>Sending medication reminders and health alerts.</li>
                            <li>Providing you with history logs and adherence reports.</li>
                            <li>Responding to your comments and questions.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                            <Lock className="text-cyan-500" />
                            3. Data Security
                        </h2>
                        <p className="leading-relaxed">
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We use Google Firebase for secure authentication and data storage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            4. Contact Us
                        </h2>
                        <p className="leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:lokeshashapu@gmail.com" className="text-cyan-600 hover:text-cyan-500 underline">lokeshashapu@gmail.com</a>.
                        </p>
                    </section>

                    <div className="text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-8 mt-8">
                        Last Updated: January 2026
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
