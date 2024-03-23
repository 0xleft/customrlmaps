import { bungySubmit } from "@/utils/bungySubmitRecaptcha";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";

function RatingStar({ isFilled, ...props }) {
    if (isFilled) {
        return <StarFilledIcon className="w-6 h-6" onMouseOver={props.onMouseEnter} onClick={props.onClick} color={props.disabled ? "gray" : "black"} />
    }
    return <StarIcon className="w-6 h-6" onMouseOver={props.onMouseEnter} onClick={props.onClick} color={props.disabled ? "gray" : "black"} />
}

export default function RatingButton({ project }) {

    const [isLoading, setIsLoading] = useState(false);
    const [rating, setRating] = useState(project.rating || 0);
    const [isRated, setIsRated] = useState(false);

    const { executeRecaptcha } = useGoogleReCaptcha();

    function submitRating(values, token) {
        if (isLoading || isRated) return;

        setIsLoading(true);
        setIsRated(true);
        fetch(`/api/project/submitRating`, {
            method: "POST",
            body: JSON.stringify({
                rating: rating,
                projectId: project.projectId,
                gRecaptchatoken: token,
            }),
        }).then((data) => data.json().then((data) => {
            setIsLoading(false);
            if (data.error) {
                toast.error("An error occurred! " + data.error);
                return;
            }
            toast.success("Rating submitted!");
        })).catch((err) => {
            setIsLoading(false);
            toast.error("An error occurred! " + err);
        });
    }


    return (
        <>
            <div className="flex items-center space-x-2 flex-row" aria-disabled={isLoading}>
                <RatingStar isFilled={rating >= 1} onMouseEnter={() => {if (isLoading || isRated) return; setRating(1)}} onClick={() => {bungySubmit(submitRating, executeRecaptcha, "submitRating", setIsLoading)}} disabled={isLoading || isRated} />
                <RatingStar isFilled={rating >= 2} onMouseEnter={() => {if (isLoading || isRated) return; setRating(2)}} onClick={() => {bungySubmit(submitRating, executeRecaptcha, "submitRating", setIsLoading)}} disabled={isLoading || isRated} />
                <RatingStar isFilled={rating >= 3} onMouseEnter={() => {if (isLoading || isRated) return; setRating(3)}} onClick={() => {bungySubmit(submitRating, executeRecaptcha, "submitRating", setIsLoading)}} disabled={isLoading || isRated} /> 
                <RatingStar isFilled={rating >= 4} onMouseEnter={() => {if (isLoading || isRated) return; setRating(4)}} onClick={() => {bungySubmit(submitRating, executeRecaptcha, "submitRating", setIsLoading)}} disabled={isLoading || isRated} /> 
                <RatingStar isFilled={rating >= 5} onMouseEnter={() => {if (isLoading || isRated) return; setRating(5)}} onClick={() => {bungySubmit(submitRating, executeRecaptcha, "submitRating", setIsLoading)}} disabled={isLoading || isRated} /> 
                {rating}
            </div>
        </>
    );
}