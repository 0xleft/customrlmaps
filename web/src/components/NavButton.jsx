import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	CubeIcon,
    HomeIcon,
    LightningBoltIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    MoonIcon,
    RocketIcon,
    SunIcon,
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';

import IsAdmin from './IsAdmin';
import { useState } from 'react';
import { SignedIn } from './SignedButtons';
import { useSession } from 'next-auth/react';

export function NavButton({ isAdmin }) {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [dropOpen, setDropOpen] = useState(false);

	const session = useSession();

  	return (
		<DropdownMenu open={dropOpen} onOpenChange={setDropOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>CustomRLMaps</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<div className='md:hidden'>
					<DropdownMenuGroup>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<MagnifyingGlassIcon className="mr-2" />
								New
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem onSelect={() => router.push("/new?type=map")}>
									<CubeIcon className="mr-2" />
									Maps
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => router.push("/new?type=mod")}>
									<LightningBoltIcon className="mr-2" />
									Mods
								</DropdownMenuItem>
							</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
				</div>
				<DropdownMenuGroup>
					<DropdownMenuItem onSelect={() => router.push('/explore')}>
						<RocketIcon className="mr-2" />
						Explore
					</DropdownMenuItem>
					<div className='hidden md:block'>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger onClick={() => {
								setDropOpen(false);
								router.push('/search');
							}}>
								<MagnifyingGlassIcon className="mr-2" />
								Search
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem onSelect={() => router.push("/search?type=map")}>
									<CubeIcon className="mr-2" />
									Maps
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => router.push("/search?type=mod")}>
									<LightningBoltIcon className="mr-2" />
									Mods
								</DropdownMenuItem>
							</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</div>
					<div className='md:hidden'>
						<DropdownMenuItem onSelect={() => router.push('/search')}>
							<MagnifyingGlassIcon className="mr-2" />
							Search
						</DropdownMenuItem>
					</div>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onSelect={() => router.push('/user')}>
						<HomeIcon className="mr-2" />
						Dashboard
					</DropdownMenuItem>
					<SignedIn session={session}>
						<IsAdmin isAdmin={isAdmin}>
							<DropdownMenuItem onSelect={() => router.push('/admin')}>
								<LockClosedIcon className="mr-2" />
								Admin
							</DropdownMenuItem>
						</IsAdmin>
					</SignedIn>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							{theme === "dark" ? <MoonIcon className="mr-2" /> : <SunIcon className="mr-2" /> }
							Theme
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem onSelect={() => setTheme("light")}>
								Light
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setTheme("dark")}>
								Dark
							</DropdownMenuItem>
						</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
  	)
}