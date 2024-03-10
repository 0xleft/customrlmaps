import { CalendarIcon } from "@radix-ui/react-icons";

const DateComponent = ({ text }) => {
    return (
        <>
            <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                    {text}
                </span>
            </div>
        </>
    );
};

export default DateComponent;