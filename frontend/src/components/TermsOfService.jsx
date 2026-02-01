import React from 'react';
import { FileText, AlertTriangle, Scale } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
                        <Scale size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Please read these terms carefully before using MediTrack.
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-white/20 space-y-10 text-slate-700 dark:text-slate-300">

                    <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                        <h3 className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-2 mb-2">
                            <AlertTriangle size={20} />
                            Medical Disclaimer
                        </h3>
                        <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
                            MediTrack is designed to assist in tracking medication and providing reminders. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            1. Acceptance of Terms
                        </h2>
                        <p className="leading-relaxed">
                            By accessing or using our service, you agree to be bound by these Terms using MediTrack. If you disagree with any part of the terms then you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            2. User Accounts
                        </h2>
                        <p className="leading-relaxed mb-4">
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            3. Termination
                        </h2>
                        <p className="leading-relaxed">
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                            4. Changes
                        </h2>
                        <p className="leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
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

export default TermsOfService;
