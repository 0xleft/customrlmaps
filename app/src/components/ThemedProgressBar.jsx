"use client";

import NextNProgress from 'nextjs-progressbar';
import { useTheme } from 'next-themes';
import { Suspense, useEffect, useState } from 'react';

export default function ThemedProgressBar() {

	return (
		<div>
            <NextNProgress color={'#666'}
                startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} options={
                { showSpinner: false }
            } />
		</div>
 );
};