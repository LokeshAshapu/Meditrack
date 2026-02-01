import React from 'react';
import { Link } from 'react-router-dom';


function MedicalSpecialities() {
    const Spacalities = [
        {
            id: 1,
            name: 'Cardiology',
            description: 'Cardiology is the branch of medicine that deals with disorders of the heart and blood vessels.',
            render_to: 'https://www.youtube.com/watch?v=Fu1u11iRKAE'
        },
        {
            id: 2,
            name: 'Neurology',
            description: 'Neurology is the branch of medicine that deals with disorders of the nervous system.',
            render_to: 'https://www.youtube.com/watch?v=BImxBFWxr7E'
        },
        {
            id: 3,
            name: 'Orthopedics',
            description: 'Orthopedics is the branch of medicine that deals with the correction of deformities of bones or muscles.',
            render_to: 'hhttps://www.youtube.com/watch?v=4QbarirGQbs'
        },
        {
            id: 4,
            name: 'Pediatrics',
            description: 'Pediatrics is the branch of medicine that involves the medical care of infants, children, and adolescents.',
            render_to: 'https://www.youtube.com/watch?v=dhpCdqOtuj0'
        },
        {
            id: 5,
            name: 'Dermatology',
            description: 'Dermatology is the branch of medicine that deals with the skin, nails, hair, and its diseases.',
            render_to: 'https://www.youtube.com/watch?v=s-26VmKhGHM'
        },
        {
            id: 6,
            name: 'Psychiatry',
            description: 'Psychiatry is the branch of medicine that deals with the diagnosis, treatment, and prevention of mental, emotional, and behavioral disorders.',
            render_to: 'https://www.youtube.com/watch?v=NQHo9vnWvHU'
        },
        {
            id: 7,
            name: 'Obstetrics and Gynecology',
            description: 'Obstetrics and Gynecology is the branch of medicine that deals with childbirth and the care of women before, during, and after they give birth.',
            render_to: 'https://www.youtube.com/watch?v=Nz9msbDY1xE&t=19s'
        },
        {
            id: 8,
            name: 'Oncology',
            description: 'Oncology is the branch of medicine that deals with the prevention, diagnosis, and treatment of cancer.',
            render_to: 'https://www.youtube.com/watch?v=vSe2RhUIjj8&t=17s'
        },
        {
            id: 9,
            name: 'Gastroenterology',
            description: 'Gastroenterology is the branch of medicine that deals with the digestive system and its disorders.',
            render_to: 'https://www.youtube.com/watch?v=V92_srz55xQ'
        },
        {
            id: 10,
            name: 'Endocrinology',
            description: 'Endocrinology is the branch of medicine that deals with the endocrine system, its diseases, and its specific secretions called hormones.',
            render_to: 'https://www.youtube.com/watch?v=wOAVmrfcRgI'
        },
        {
            id: 11,
            name: 'Urology',
            description: 'Urology is the branch of medicine that focuses on the urinary tract and the male reproductive system.',
            render_to: 'https://www.youtube.com/watch?v=c9x2XxUs8ns'
        },
        {
            id: 12,
            name: 'Ophthalmology',
            description: 'Ophthalmology is the branch of medicine that deals with the anatomy, physiology, and diseases of the eye.',
            render_to: 'https://www.youtube.com/watch?v=dr-LjK6BpFQ'
        },
        {
            id: 13,
            name: 'Rheumatology',
            description: 'Rheumatology is the branch of medicine that deals with the diagnosis and therapy of rheumatic diseases.',
            render_to: 'https://www.youtube.com/watch?v=vo6-EINYeiY'
        },
        {
            id: 14,
            name: 'Hematology',
            description: 'Hematology is the branch of medicine concerned with the study, diagnosis, treatment, and prevention of blood disorders.',
            render_to: 'https://www.youtube.com/watch?app=desktop&v=Aal8wVuHybc'
        },
        {
            id: 15,
            name: 'Pulmonology',
            description: 'Pulmonology is the branch of medicine that deals with diseases involving the respiratory tract.',
            render_to: 'https://www.youtube.com/watch?v=v026ge-oTyw'
        },
        {
            id: 16,
            name: 'Nephrology',
            description: 'Nephrology is the branch of medicine that deals with the study of kidney function and kidney diseases.',
            render_to: 'https://www.youtube.com/watch?v=LnLqv6pIWso'
        },
        {
            id: 17,
            name: 'Geriatrics',
            description: 'Geriatrics is the branch of medicine that focuses on health care of elderly people.',
            render_to: 'https://www.youtube.com/watch?v=RIpKOALkFjI'
        },
        {
            id: 18,
            name: 'Infectious Diseases',
            description: 'Infectious Diseases is the branch of medicine that deals with the diagnosis and treatment of infections caused by bacteria, viruses, fungi, and parasites.',
            render_to: 'https://www.youtube.com/watch?v=Kr-H3pJ--zo'
        }
    ]
    return (
        <>
            <div className="min-h-screen w-full px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
                            Medical Specialities
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                            Explore diverse branches of medicine and learn about treatments for various conditions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Spacalities.map((speciality) => (
                            <div
                                key={speciality.id}
                                className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">{speciality.name}</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 relative z-10 leading-relaxed min-h-[80px]">
                                    {speciality.description}
                                </p>
                                {speciality.render_to && (
                                    <a
                                        href={speciality.render_to}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative z-10 inline-flex items-center text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors"
                                    >
                                        Watch Video <span className="ml-2">→</span>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default MedicalSpecialities;