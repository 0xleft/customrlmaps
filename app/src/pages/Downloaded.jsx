import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
const { ipcRenderer } = require('electron');

function DownloadedProject({ data }) { // project, downloadedVersions,

    const [selectedVersion, setSelectedVersion] = useState("");
    let versionsList = [];
    versionsList = data.downloadedVersions.map(version => {
        if (version.version === data.latestVersion) {
            return {
                value: version.version,
                label: `${version.version} (latest)`,
            };
        }
        
        return {
            value: version.version,
            label: version.version,
        };
    }).reverse();

    let description = data.description;
	if (!description) {
        description = "No description provided."
    }

    if (description.length > 100) {
        description = description.slice(0, 100) + "..."
    }

    if (!data.imageUrl) {
        data.imageUrl = "/rocketleague.jpg"
    }

    return (
        <Card className="relative overflow-hidden">
            <img src={data.imageUrl} alt={data.name} className="absolute top-0 left-0 w-[33%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
            onClick={() => {
                
            }} />
            <div className="ml-[33%]">
                <CardHeader>
                    <CardTitle className="flex flex-row justify-between items-center mb-2">
                        {data.name}

                        <div className="flex">
                            <DropdownMenu className="">
                                <DropdownMenuTrigger asChild>
                                    <Button>Actions</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onSelect={() => {
                                            toast.loading("Downloading project...", { dismissible: true });
                                            ipcRenderer.invoke('setLabsUnderpass', {
                                                name: data.name,
                                                version: selectedVersion === "" ? data.latestVersion : selectedVersion
                                            }).then((res) => {
                                                toast.dismiss();
                                                if (res) {
                                                    toast.success("Successfully set Labs Underpass");
                                                } else {
                                                    toast.error("Failed to set Labs Underpass, make sure Rocket League is running and try again.");
                                                }
                                            });
                                        }}>
                                            Set {selectedVersion === "" ? "latest" : selectedVersion} as Labs Underpass
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                Select version
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                {versionsList.map(version => {
                                                    return (
                                                        <DropdownMenuItem key={version.value} onSelect={() => {
                                                            setSelectedVersion(version.value);
                                                        }}>
                                                            {version.label}
                                                        </DropdownMenuItem>
                                                    );
                                                })}                                                   
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => {
                                            // todo
                                        }}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <DateComponent text={data.updated || "unknown"} />
                    <Badge className="">{data.type}</Badge>
                </CardFooter>
            </div>
        </Card>
    )
}

function Downloaded() {
	const [projects, setProjects] = useState({});

	// get downloaded projects
	ipcRenderer.invoke('getProjectsMeta').then((newProjects) => {
		setProjects(newProjects);
	});

	return (
		<>
			<div className="container p-4">
				<Card className="w-full">
					<CardHeader className="w-full">
						<CardTitle>
							Downloaded Projects
						</CardTitle>
						<CardDescription>
							<p>
								Manage your downloaded projects
							</p>
						</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col space-y-4">
						{
							Object.keys(projects).map((project) => {
								return <DownloadedProject data={projects[project]} />
							})
						}
					</CardContent>
				</Card>
			</div>
		</>
	)
}

export default Downloaded