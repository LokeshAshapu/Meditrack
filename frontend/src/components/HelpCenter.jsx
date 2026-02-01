import React from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const HelpCenter = () => {
    const [openIndex, setOpenIndex] = React.useState(null);

    const faqs = [
        {
            question: "How does the Medication Tracker work?",
            answer: "You can add your medications, set specific times, and choose your frequency (daily or specific days). We'll send you reminders via email, and if you have SOS enabled, via SMS and Voice calls if you miss them."
        },
        {
            question: "Is my medical data safe?",
            answer: "Yes, absolutely. We use industry-standard encryption and Firebase security rules to ensure your data is private and only accessible by you."
        },
        {
            question: "What happens if I miss a dose?",
            answer: "If you don't mark a medication as taken, our system (if configured) can trigger a 'Health Alert' which notifies your emergency contacts or calls your phone to ensure you're okay."
        },
        {
            question: "How do I update my profile?",
            answer: "Go to your Dashboard and click on 'Edit Profile'. You can update your name, phone number for alerts, and password there."
        }
    ];

    return (
        <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                        Help Center
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Find answers to common questions and learn how to get the most out of MediTrack.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-400">
                                        <HelpCircle size={20} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                        {faq.question}
                                    </h3>
                                </div>
                                {openIndex === index ? (
                                    <ChevronUp className="text-slate-400" />
                                ) : (
                                    <ChevronDown className="text-slate-400" />
                                )}
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-6 pl-[4.5rem] text-slate-600 dark:text-slate-400 animate-in slide-in-from-top-2 fade-in duration-200">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800">
                    <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Still have questions?</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Our support team is always ready to help you.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1 transition-all"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
