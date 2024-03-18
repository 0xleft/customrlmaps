import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';

 
const FormSchema = z.object({
    version: z.string().nonempty("Version is required"),
})

export function VersionDialog({ versions = [], projectname, open, onClose }) {

    const router = useRouter();
    const [selectedVersion, setSelectedVersion] = useState("");

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Select version</DialogTitle>
                <DialogDescription>
                    Select the version you want to edit.
                </DialogDescription>
                </DialogHeader>

                <div className="flex flex-row space-x-2">
                    <Select onValueChange={
                        (e) => {
                            console.log(e);
                            setSelectedVersion(e);
                        }
                    }>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {versions.map((version) => (
                                    <SelectItem key={version.value} value={version.value}
                                        onClick={(e) => {
                                            console.log(e);
                                            setSelectedVersion(e);
                                        }}
                                    >
                                        {version.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button type="button"
                        onClick={
                            () => {
                                open = false;
                                router.push(`/project/${projectname}/version/${selectedVersion}/edit`);
                            }
                        }
                        disabled={selectedVersion == ""}
                    >Select</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}