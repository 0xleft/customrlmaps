async function getSiteverifyResponse(token) {
    return fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });
}

async function verifyCaptcha(token, action) {
    const response = await (await getSiteverifyResponse(token)).json();
    return response.score > 0.5 && response.action === action && response.success === true;
}

export { getSiteverifyResponse, verifyCaptcha };