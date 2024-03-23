import { toast } from "sonner";

// bungy as in a trampoline
function bungySubmit(onSubmit, executeRecaptcha, action, setUploading = () => {}, values = {}) {
    setUploading(true);
    if (!executeRecaptcha) {
        toast.error("Recaptcha failed to load. Please refresh the page.");
        setUploading(false);
        return;
    }

    executeRecaptcha(action).then((token) => {
        onSubmit(values, token);
    });
}

export { bungySubmit };