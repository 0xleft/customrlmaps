"use client";

import MapSearchForm from '@/components/MapSearchForm';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import { AddButton } from './AddButton';
import { NavButton } from './NavButton';
import { SignedIn, SignedOut } from './SignedButtons';
import { Button } from './ui/button';
import { NavBreadcrumbs } from './NavBreadcrumbs';
import UserButton from './UserButton';
import { Skeleton } from './ui/skeleton';

function NavbarSkeleton() {
	"use client";
	return (
		<header className='text-primary body-font bg-primary-foreground shadow'>
			<div className='mx-auto flex flex-wrap p-2 flex-row md:flex-row items-center justify-between ml-3 mr-3'>
				<div className='flex flex-row items-center space-x-2'>
					<NavButton />
					{/* icon too // todo */}
					<Link href='/'>
						<Button variant='hero'>CustomRLMaps</Button>
					</Link>
					<div className='hidden md:flex'>
						<Skeleton className='w-96 h-6' />
					</div>
				</div>
				<div className='md:flex items-center space-x-2 flex-row flex'>
					<AddButton />
					<div className='hidden md:flex space-x-2'>
						<Skeleton className='w-52 h-10' />
						<Skeleton className='w-10 h-10' />
					</div>
					<Skeleton className='w-10 h-10 rounded-full' />
				</div>
			</div>
		</header>
	)
}

export default function Navbar() {
	const session = useSession();

	const [isAdmin, setIsAdmin] = useState(false);

	useCallback(() => {
		fetch('/api/user/isAdmin', {
			method: 'GET',
		}, { next: { revalidate: 60 } }).then((res) => res.json()).then((data) => {
			setIsAdmin(data.isAdmin);
		}).catch((error) => {
		});
	}, []);

	if (!session) return <NavbarSkeleton />;
	if (session.status == "loading") return <NavbarSkeleton />;

  	return (
		<header className='text-primary body-font bg-primary-foreground shadow'>
			<div className='mx-auto flex flex-wrap p-2 flex-row md:flex-row items-center justify-between ml-3 mr-3'>
				<div className='flex flex-row items-center space-x-2'>
					<NavButton isAdmin={isAdmin} />
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
						<Button variant=''
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