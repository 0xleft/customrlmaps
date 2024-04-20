import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
const { ipcRenderer } = require('electron');

function DownloadedProject({ data }) { // project, downloadedVersions, 
	if (!description) {
        description = "No description provided."
    }

    if (description.length > 100) {
        description = description.slice(0, 100) + "..."
    }

    if (!image) {
        image = "/rocketleague.jpg"
    }

    return (
        <Card className="relative overflow-hidden">
            <img src={image} alt={title} className="absolute top-0 left-0 w-[33%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
            onClick={() => {
                // todo
            }} />
            <div className="ml-[33%]">
                <CardHeader>
                    <CardTitle>
                        <Link href={link || "/"} className="hover:underline flex flex-row space-x-4">
                            {title}
                            {isPrivate && <LockClosedIcon className="w-6 h-6" />}
                        </Link>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <DateComponent text={createdAt || "unknown"} />
                    <Badge className="">{type}</Badge>
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