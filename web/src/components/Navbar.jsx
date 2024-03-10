"use client";

import React from 'react';
import Link from 'next/link';
import { SignedOut, UserButton, SignedIn, useUser } from '@clerk/nextjs';
import { hasRole, getUserRoles } from '@/utils/userUtils';
import { Button } from './ui/button';
import MapSearchForm from '@/components/MapSearchForm';
import { useRouter } from 'next/router';
import { ModeToggle } from './ModeToggle';
import { NavButton } from './NavButton';
import { AddButton } from './AddButton';
import { NavBreadcrumbs } from './NavBreadcrumbs';

const Navbar = () => {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	if (!isLoaded) return null;

	const userRoles = getUserRoles(user);

	// move to another component?
	if (router.pathname === '/admin' && !hasRole(userRoles, "admin")) {
		router.push('/');
	}

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
				<nav className='md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center'>
					<SignedIn>
						
					</SignedIn>
				</nav>
				<div className='md:flex items-center space-x-2 flex-row flex'>
					<AddButton />
					<div className='hidden md:flex'>
						<MapSearchForm />
					</div>
					<SignedOut>
						<Link href='/sign-in'>
							<Button variant='outline'>Sign in</Button>
						</Link>
						<Link href='/sign-up'>
							<Button variant='outline'>Sign up</Button>
						</Link>
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</div>
		</header>
  	);
};

export default Navbar;