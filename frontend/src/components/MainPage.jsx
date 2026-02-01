import React from 'react';



function MainPage() {
    return (
        <div className="min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section 1 */}
                <div className="mb-20">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
                        About This Project
                    </h2>

                    <div className="flex flex-col-reverse md:flex-row items-center gap-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
                        <div className="flex flex-col gap-6 md:w-1/2 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                            <p>
                                This project is a <span className="font-bold text-indigo-600 dark:text-cyan-400">comprehensive and user-friendly directory</span>, developed to help users easily explore and understand the diverse branches of modern medicine.
                            </p>
                            <p>
                                Each speciality is presented in an intuitive card format, offering <span className="font-bold text-indigo-600 dark:text-cyan-400">concise yet informative descriptions</span> that make learning accessible to everyone.
                            </p>
                            <p>
                                Our goal is to <span className="font-bold text-indigo-600 dark:text-cyan-400">simplify complex medical information</span>. By bridging the gap between medical knowledge and public understanding, this platform serves as an educational tool for all.
                            </p>
                            <p>
                                Explore the fields of cardiology, neurology, orthopedics, psychiatry, and many more — all in one place.
                            </p>
                        </div>
                        <div className="md:w-1/2 w-full">
                            <img
                                src="/medicine.png"
                                alt="Medicine"
                                className="rounded-2xl shadow-2xl w-full object-cover hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="flex flex-col md:flex-row items-center gap-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
                    <div className="md:w-1/2 w-full">
                        <img
                            src="/dosage_limit.png"
                            alt="Dosage Limit"
                            className="rounded-2xl shadow-2xl w-full object-cover hover:scale-[1.02] transition-transform duration-500"
                        />
                    </div>
                    <div className="flex flex-col gap-6 md:w-1/2 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                        <h3 className="text-3xl font-bold text-indigo-600 dark:text-cyan-400 mb-2">Medical Alert Scheduler</h3>
                        <p>
                            A simple yet powerful web-based reminder system designed to help individuals manage their daily medication or health-related tasks effectively.
                        </p>
                        <p>
                            This platform allows users to <span className="font-bold text-indigo-600 dark:text-cyan-400">set daily alerts</span> at specific times, providing a convenient way to stay on track with medications, health checks, or doctor consultations.
                        </p>
                        <p>
                            Whether you're managing your own health or caring for a loved one, this tool can play a crucial role in promoting regularity, safety, and peace of mind.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainPage;
