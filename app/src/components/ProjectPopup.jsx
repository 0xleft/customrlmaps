import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Combobox } from '@/components/Combobox';
import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function ProjectPopupContent({ project, username, versions }) {
    const { name } = useParams();

    const navigate = useNavigate();
    const [selectedVersion, setSelectedVersion] = useState("");

    // maybe a better method to make the latest version the first in the list
    let versionsList = [];
    versionsList = versions.map(version => {
        if (version.version === project.latestVersion) {
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

    return (
        <>
            <Card className="w-full">
                <CardHeader className="flex-col flex">
                    <CardTitle className="flex flex-row justify-between items-center mb-2">
                        <div className='w-full'>
                            <h1 className='text-4xl flex flex-col'>
                                <p>
                                    {project.name}
                                </p>
                                <div className='flex flex-row space-x-2'>
                                    <Badge className='h-6 mt-2 w-max'>{project.type}</Badge>
                                </div>
                            </h1>
                        </div>

                        <div className="flex">
                            <DropdownMenu className="">
                                <DropdownMenuTrigger asChild>
                                    <Button className='mt-4'>Actions</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Download</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onSelect={() => {
                                            let version = versions.find(version => version.version === project.latestVersion);

                                            if (!version) {
                                                toast.error("No latest version found");
                                                return;
                                            }
                                            fetch(version.downloadUrl).then(res => res.json()).then(data => {
                                                if (data.error) {
                                                    toast.error(data.error);
                                                    return;
                                                }

                                                // todo
                                            });
                                        }}>
                                            Download {selectedVersion === "" ? "latest" : selectedVersion}
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
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardTitle>
                    <Separator />
                    
                </CardHeader>

                <CardContent>
                    <div className='flex flex-col'>
                        <div className=' overflow-clip'>
                            <AspectRatio ratio={16 / 9} className="bg-muted overflow-clip">
                                <img src={project.imageUrl} alt={`Unable to load image for ${project.name}`} className="rounded-md object-cover w-full" />
                            </AspectRatio>
                        </div>

                        <div className='mt-2 flex flex-col space-y-4'>

                            <h2 className='text-xl font-bold'>Creator: <span className='text-muted-foreground font-normal'>
                                <Link href={`/user/${username}`} className='hover:underline'>
                                    @{username}
                                </Link></span>
                            </h2>

                            <div className='flex flex-col'>
                                <div>
                                    <div className='flex flex-row items-center space-x-2'>
                                        <h2 className=''>Average rating: </h2>
                                        <Badge>{project.averageRating === 0 ? "No rating" : project.averageRating.toFixed(1)}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <h2 className=''>Downloads: <span className='text-muted-foreground font-normal'>{project.downloads}</span></h2>
                                    <h2 className=''>Views: <span className='text-muted-foreground font-normal'>{project.views}</span></h2>
                                </div>
                            </div>

                            <div>
                                <h2 className='text-xl font-bold'>Description:</h2>
                                <p className='text-muted-foreground break-words'>
                                    {project.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <DateComponent text={`Last updated ${project.updated}`} />
                </CardFooter>
            </Card>
        </>
    );
}

export default ProjectPopupContent