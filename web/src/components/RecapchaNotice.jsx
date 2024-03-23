export default function RecaptchaNotice() {
    return (
        <>
            <p className='text-sm sm:ml-4 sm:pl-4 sm:py-2 sm:mt-0 mt-4 text-center w-full'>
            This site is protected by reCAPTCHA and the Google{" "}
            <a className="underline" href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
            <a className="underline" href="https://policies.google.com/terms">Terms of Service</a> apply.
            </p>
        </>
    );
};