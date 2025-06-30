import React from 'react';
import NavBar from './NavBar';
import MadicalFooter from './MedicalFooter';

function MainPage() {
    return (
        <div className="bg-white min-h-screen">
            <NavBar />
            <div className="max-w-6xl mx-auto px-4 py-15">
                <h2 className="text-4xl font-bold mb-8 text-center text-indigo-700">
                    About This Project
                </h2>
                <div className="flex flex-col-reverse md:flex-row items-center gap-10 mb-16 mt-15">
                    <div className="flex flex-col gap-4 md:w-1/2">
                        <p className="text-gray-700 leading-relaxed">
                            This project is a <span className="font-bold">comprehensive and user-friendly directory of medical specialities</span>, developed to help users easily explore and understand the diverse branches of modern medicine.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Each speciality is presented in an intuitive card format, offering <span className="font-bold">concise yet informative descriptions</span> that make learning accessible to everyone — whether you're a medical student, healthcare professional, or a patient seeking clarity about your treatment options.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Our goal is to <span className="font-bold">simplify complex medical information</span> and present it in a visually organized manner. By bridging the gap between medical knowledge and public understanding, this platform serves as an educational tool, a reference guide, and a first step toward informed healthcare decisions.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Explore the fields of cardiology, neurology, orthopedics, psychiatry, and many more — all in one place.
                        </p>
                    </div>
                    <img
                        src="src/assets/medicine.png"
                        alt="Medicine"
                        className="rounded-xl shadow-2xl w-full md:w-1/2"
                    />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-10 mt-21">
                    <img
                        src="src/assets/dosage_limit.png"
                        alt="Dosage Limit"
                        className="rounded-xl shadow-2xl w-full md:w-1/2"
                    />
                    <div className="flex flex-col gap-4 md:w-1/2">
                        <p className="text-gray-700 leading-relaxed">
                            <span className="font-bold">Medical Alert Scheduler</span> is a simple yet powerful web-based reminder system designed to help individuals manage their daily medication or health-related tasks effectively. Our goal is to ensure that no dose or important medical task is ever missed.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This platform allows users to <span className="font-bold">set daily alerts</span> at specific times, providing a convenient way to stay on track with medications, health checks, or doctor consultations. Once a time is scheduled, the system will automatically send out reminders each day — keeping health routines consistent and on time.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Whether you're managing your own health or caring for a loved one, this tool can play a crucial role in promoting regularity, safety, and peace of mind.
                        </p>
                    </div>
                </div>
            </div>
            <MadicalFooter />
        </div>
    );
}

export default MainPage;
