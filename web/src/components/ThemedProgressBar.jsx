import NextNProgress from 'nextjs-progressbar';
import { useTheme } from 'next-themes';

export default function ThemedProgressBar() {
	
    const { theme } = useTheme();

	return (
		<>
            <NextNProgress color={theme === 'dark' ? '#aaa' : '#000'}
                startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} options={
                { showSpinner: false }
            } />
		</>
 );
};