import CustomError from "@/components/CustomError"

function Error({ statusCode }) {
    return (
        <CustomError error={statusCode}>
            <h1 className='text-muted-foreground'>An error occurred</h1>
        </CustomError>
    )
    }

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error