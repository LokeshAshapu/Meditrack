

function ContactPage() {
    function handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
        })
            .then(response => {
                if (response.ok) {
                    alert("Thanks for filling out the form!");
                    window.location.reload();
                } else {
                    alert("There was an error submitting the form.");
                }
            })
            .catch(error => {
                console.error("Form error:", error);
                alert("Something went wrong.");
            });
    }

    return (
        <div className='min-h-screen py-20 px-4'>
            <div className='max-w-4xl mx-auto'>
                <div className="text-center mb-12">
                    <h2 className='text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500'>Contact Us</h2>
                    <p className='text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto'>
                        If you have any questions, suggestions, or feedback about this project,
                        please feel free to reach out to us. We are always looking to improve.
                    </p>
                </div>

                <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20 max-w-2xl mx-auto'>
                    <form
                        className='w-full space-y-6'
                        onSubmit={handleSubmit}
                        action="https://formsubmit.co/lokeshashapu@gmail.com"
                        method="POST"
                    >
                        {/* <input type="hidden" name="_captcha" value="false" /> */}
                        <div>
                            <label htmlFor="email" className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder='Enter your email...'
                                required
                                className='w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors'
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                placeholder='Type your message here...'
                                required
                                className='w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors resize-none'
                            ></textarea>
                        </div>
                        <div className='pt-4'>
                            <button
                                type="submit"
                                className='w-full bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-lg px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/30'
                                disabled={false} >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;