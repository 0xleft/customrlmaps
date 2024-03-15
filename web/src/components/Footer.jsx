const Footer = () => {
    return (
        <>
            <footer className='text-center py-4 shadow-md'>
                <div className='container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col'>
                    <p className='text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4'>
                    © {new Date().getFullYear()} CustomRLMaps.
                    </p>
                </div>
            </footer>
        </>
    );
};

export default Footer;