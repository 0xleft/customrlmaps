export default function CustomError({ children, error, ...props }) {
	return (
        <>
            <div className={`flex flex-col items-center justify-center h-screen`}>
                <h1 className="text-4xl font-bold">{error}</h1>
                {children}
            </div>
        </>
    );
};