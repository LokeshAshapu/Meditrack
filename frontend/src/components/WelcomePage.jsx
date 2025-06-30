import React from 'react';
import { Link } from 'react-router-dom';

function WelcomePage() {
    return (
    <>
        <div className="flex flex-col items-center justify-center h-screen bg-indigo-100 p-6">
            <img src="src\assets\medicine.png" alt="Medicine" width="200px" className='rounded-lg shadow-2xl mb-6' />
            <h1 class="text-4xl font-bold">Welcome to Meditrack</h1>
            <p className="mt-4 text-lg text-gray-600">
                This tool helps you update the medicine on completion.
            </p>
            <div className="mt-8">
                <Link to="/main" className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-500 hover:shadow-lg">
                    Get Started <i class="fa-solid fa-arrow-right-long"></i>
                </Link>
            </div>
        </div>
    </>
    );
}

export default WelcomePage;
