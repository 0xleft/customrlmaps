import { Combobox } from '@/components/Combobox';
import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getAllUserInfo } from '@/utils/apiUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { CheckIcon, CircleIcon, ReloadIcon, UpdateIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import { z } from 'zod';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog"
import { Select } from '@/components/ui/select';
import { VersionDialog } from './_VersionDialog';
import { DangerDialog } from './_DangerDialog';
import { Toaster, toast } from 'sonner';

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    const { projectname, version } = params;
    const currentUser = await getAllUserInfo(req);

    const project = await prisma.project.findUnique({
        where: {
            name: projectname,
        }
    });

    if (!project || project.publishStatus !== "PUBLISHED" && (!currentUser || currentUser.dbUser?.id !== project.userId)) {
        return {
            props: {
                notFound: true,
            },
        };
    }

    if (project.publishStatus === "DELETED") {
        return {
            props: {
                notFound: true,
            },
        };
    }

    // get versions
    const versionDb = await prisma.version.findUnique({
        where: {
            projectId: project.id,
            version: version,
        }
    });

    if (!versionDb) {
        return {
            props: {
                notFound: true,
            },
        };
    }

	return {
		props: {
            project: {
                name: project.name,
                description: project.description,
                longDescription: project.longDescription,
                imageUrl: project.imageUrl,
                created: `${project.createdAt.getDate()}/${project.createdAt.getMonth()}/${project.createdAt.getFullYear()}`,
                updated: `${project.updatedAt.getDate()}/${project.updatedAt.getMonth()}/${project.updatedAt.getFullYear()}`,
                downloads: project.downloads,
                tags: project.tags,
                publishStatus: project.publishStatus,
                type: project.type,
                views: project.views,
            },
            version: {
                version: versionDb.version,
                changes: versionDb.changes,
                downloadUrl: versionDb.downloadUrl,
            }
        },
	};
};


export default function EditProjectPage ( { version, project }) {

    if (notFound) {
        return (
            <CustomError error="404">
                <h1 className='text-muted-foreground'>Map not found</h1>
            </CustomError>
        );
    }

    return (
        <>
            <div className='container pt-6'>
                <Card>
                    
                </Card>
            </div>
        </>
    );
};