export default function RecaptchaNotice({...props}) {
    return (
        <>
            <p className={'text-sm w-full ' + (props.className ? ` ${props.className}` : '')}>
            This site is protected by reCAPTCHA and the Google{" "}
            <a className="underline" href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
            <a className="underline" href="https://policies.google.com/terms">Terms of Service</a> apply.
            </p>
        </>
    );
};