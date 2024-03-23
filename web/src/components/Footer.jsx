export default function Footer() {
    return (
        <>
            <footer className='text-center py-4 shadow-md'>
                <div className='container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col'>
                    <p className='text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4 text-center w-full'>
                    © {new Date().getFullYear()} CustomRLMaps. <br />
                    In no way affiliated with Psyonix or Epic Games.

                    <br />
                    <br />

                    This site is protected by reCAPTCHA and the Google{" "}
                    <a className="underline" href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
                    <a className="underline" href="https://policies.google.com/terms">Terms of Service</a> apply.
                    </p>

                    
                </div>
            </footer>
        </>
    );
};