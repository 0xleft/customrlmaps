"use client";

import React from 'react';
import Link from 'next/link';
import { SignedOut, UserButton, SignedIn, useUser } from '@clerk/nextjs';
import { hasRole, getUserRoles } from '@/utils/userUtils';
import { Button } from './ui/button';
import MapSearchForm from '@/pages/maps/MapSearchForm';

const Navbar = () => {
	const { isSignedIn, user, isLoaded } = useUser();
	if (!isLoaded) return null;

	const userRoles = getUserRoles(user);

	const links = [
		{ title: 'Profile', url: '/profile' },
		{ title: 'Dashboard', url: '/user' },
		{ title: 'Admin Dashboard', url: '/admin', role: 'admin' },
	];

  	return (
		<header className='text-gray-600 body-font bg-white shadow'>
			<div className='container mx-auto flex flex-wrap p-2 flex-col md:flex-row items-center justify-between'>
				<div className='flex flex-row'>
					<Link href='/'>
						<Button variant='hero'>CustomRLMaps</Button>
					</Link>
					<MapSearchForm />
				</div>
				<nav className='md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center'>
					<SignedIn>
						{links.map((link) =>
							(link.role === 'admin' && hasRole(userRoles, "admin")) || !link.role ? (
								<Link key={link.title} href={link.url}>
									<Button variant='link'>{link.title}</Button>
								</Link>
							) : null
						)}
					</SignedIn>
				</nav>
				<div className='md:flex items-center'>
					<SignedOut>
						<Link href='/sign-in'>
							<Button variant='link'>Sign in</Button>
						</Link>
						<Link href='/sign-up'>
							<Button variant='link'>Sign up</Button>
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