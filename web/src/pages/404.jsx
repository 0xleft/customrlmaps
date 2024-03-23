import CustomError from "@/components/CustomError";

export default function Custom404() {
    return (
        <CustomError error="404">
            <h1 className='text-muted-foreground'>Page not found</h1>
        </CustomError>
    )
}