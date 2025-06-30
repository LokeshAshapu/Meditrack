import MedicalFooter from './MedicalFooter';
import NavBar from './NavBar';

function ContactPage(){
    return (
        <div className='bg-white'>
            <NavBar />
            <div className='p-10 mt-6'>
                <h2 className='text-3xl font-bold mb-2 text-center text-indigo-700'>Contact Us</h2>
                <div className='flex items-center p-3 sm:flex-col lg:flex-row'>
                    <p className='text-gray-700 text-center mr-5'>
                        If you have any questions, suggestions, or feedback about this project,
                        please feel free to reach out to us. We are always looking to improve and provide the best experience for our users.
                    </p>
                </div>
                <div className='flex flex-col items-center mt-10 p-6 max-w-lg mx-auto border border-gray-300 rounded-lg shadow-lg bg-white'>
                    <form
                        className='w-full space-y-4'
                        action="https://formsubmit.co/lokeshashapu@gmail.com"
                        method="POST"
                        >
                            <input type="hidden" name="_captcha" value="false" />
                            {/* Redirect to thank you page after submission (optional) */}
                            <input type="hidden" name="_next" value="https://yourdomain.com/thank-you" />
                            <div>
                                <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder='Enter your email...'
                                    required
                                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="6"
                                    placeholder='Type your message here...'
                                    required
                                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
                                ></textarea>
                            </div>
                            <div className='flex justify-center'>
                                <button
                                    type="submit"
                                    className='bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 duration-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                                    disabled={false} >
                                        Send Message
                                </button>
                            </div>
                    </form>
                </div>
            </div>
            < MedicalFooter />
        </div>
    );
}

export default ContactPage;