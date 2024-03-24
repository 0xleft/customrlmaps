import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';

 
export function DangerDialog({ projectname, open, onClose }) {

    const router = useRouter();
    const [confirmationText, setConfirmationText] = useState("");
    const [understood, setUnderstood] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Delete {projectname}?</DialogTitle>
                <DialogDescription className="mb-4">
                    Your project will be marked as deleted and noone will be able to visit it. Deleted projects are purged after 6 months. Type <span className="font-bold">{projectname}</span> to confirm.
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
                        I understand that
                    </label>
                </div>

                <div className="flex flex-row space-x-2">
                    <Input type="text" placeholder={projectname} onChange={(e) => {
                        setConfirmationText(e.target.value);
                    }} />
                    <Button variant="destructive" type="button" onClick={() => {
                        toast.loading("Deleting project...", { dismissible: true });
                        setLoading(true);
                        fetch(`/api/project/delete`, {
                            method: 'POST',
                            body: JSON.stringify({
                                name: projectname,
                            }),
                        }).then((res) => res.json()).then((data) => {
                            if (data.error) {
                                toast.error(data.error);
                            }
                            toast.success("Project deleted!");
                            toast.dismiss();
                            router.push(`/`);
                        }).catch((e) => {
                            toast.error("An error occurred! " + e);
                        });
                    }} disabled={(confirmationText !== projectname) || !understood || loading}>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}