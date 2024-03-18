import MapSearchForm from '@/components/MapSearchForm';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

import { AddButton } from './AddButton';
import { NavButton } from './NavButton';
import { SignedIn, SignedOut } from './SignedButtons';
import { Button } from './ui/button';
import { NavBreadcrumbs } from './NavBreadcrumbs';
import UserButton from './UserButton';

export default function Navbar() {
	const session = useSession();

	if (!session) return null;
	if (session.status == "loading") return null;

  	return (
		<header className='text-primary body-font bg-secondary shadow'>
			<div className='mx-auto flex flex-wrap p-2 flex-row md:flex-row items-center justify-between ml-3 mr-3'>
				<div className='flex flex-row items-center space-x-2'>
					<NavButton />
					{/* icon too // todo */}
					<Link href='/'>
						<Button variant='hero'>CustomRLMaps</Button>
					</Link>
					<div className='hidden md:flex'>
						<NavBreadcrumbs />
					</div>
				</div>
				<div className='md:flex items-center space-x-2 flex-row flex'>
					<AddButton />
					<div className='hidden md:flex'>
						<MapSearchForm />
					</div>
					<SignedOut session={session}>
						<Button variant='outline'
							onClick={() => signIn()}
						>Sign in</Button>
					</SignedOut>
					<SignedIn session={session}>
						<UserButton session={session} />
					</SignedIn>
				</div>
			</div>
		</header>
  	);
};