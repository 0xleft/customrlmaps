import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

 
const FormSchema = z.object({
    version: z.string().nonempty("Version is required"),
})

export default function DangerDialog({ projectname, open, onClose, version }) {

    const router = useRouter();
    const [understood, setUnderstood] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Delete version {version}?</DialogTitle>
                <DialogDescription className="mb-4">
                    Your version will be marked as deleted and noone will be able to visit it. Deleted versions are purged every hour
                </DialogDescription >

                </DialogHeader>

                <div className="flex items-center space-x-2">
                    <Checkbox id="explanation" onClick={() => {
                        setUnderstood(!understood);
                    }} />
                    <label
                        htmlFor="explanation"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I understand that this action is irreversible
                    </label>
                </div>

                <div className="flex flex-row space-x-2">
                    <Button variant="destructive" type="button" onClick={() => {
                        toast.loading("Deleting version...", { dismissible: true });
                        setLoading(true);
                        fetch(`/api/project/version/delete`, {
                            method: 'POST',
                            body: JSON.stringify({
                                name: projectname,
                                versionString: version,
                            }),
                        }).then((res) => res.json()).then((data) => {
                            if (data.error) {
                                toast.dismiss();
                                toast.error(data.error);
                                setLoading(false);
                                return;
                            }
                            toast.dismiss();
                            toast.success("Version deleted!");
                            router.push(`/project/${projectname}`);
                            setLoading(false);
                        }).catch((e) => {
                            toast.dismiss();
                            toast.error("An error occurred! " + e);
                            setLoading(false);
                        });
                    }} disabled={!understood || loading}>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}