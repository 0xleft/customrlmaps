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
    LightningBoltIcon,
    MagnifyingGlassIcon,
    GearIcon,
} from '@radix-ui/react-icons';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function NavButton() {
	const navigate = useNavigate();
	const [dropOpen, setDropOpen] = useState(false);

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
				<DropdownMenuGroup>
					<div className='hidden md:block'>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger onClick={() => {
								setDropOpen(false);
								navigate('/search');
							}}>
								<MagnifyingGlassIcon className="mr-2" />
								Search
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem onSelect={() => navigate("/search?type=map")}>
									<CubeIcon className="mr-2" />
									Maps
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => navigate("/search?type=mod")}>
									<LightningBoltIcon className="mr-2" />
									Mods
								</DropdownMenuItem>
							</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</div>
					<div className='md:hidden'>
						<DropdownMenuItem onSelect={() => navigate('/search')}>
							<MagnifyingGlassIcon className="mr-2" />
							Search
						</DropdownMenuItem>
					</div>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => navigate('/multiplayer')}>
						<LightningBoltIcon className="mr-2" />
						Multiplayer
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => navigate('/downloaded')}>
						<CubeIcon className="mr-2" />
						Downloaded
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => navigate('/settings')}>
						<GearIcon className="mr-2" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
  	)
}