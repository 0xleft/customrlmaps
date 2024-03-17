import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
 
export function DangerDialog({ username, open, onClose }) {

    const router = useRouter();
    const [confirmationText, setConfirmationText] = useState("");
    const [understood, setUnderstood] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Delete {username}?</DialogTitle>
                <DialogDescription className="mb-4">
                    Your user will be marked as deleted and noone will be able to visit your profile or see your projects. Deleted users are purged after 6 months. Type <span className="font-bold">{username}</span> to confirm.
                </DialogDescription >

                </DialogHeader>

                <div className="flex items-center space-x-2">
                    <Checkbox id="explanation" onClick={() => {
                        console.log(understood);
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
                    <Input type="text" placeholder={username} onChange={(e) => {
                        setConfirmationText(e.target.value);
                    }} />
                    <Button variant="destructive" type="button" onClick={() => {
                        toast.loading("Deleting user...");
                        setLoading(true);
                        fetch(`/api/user/delete`, {
                            method: 'POST',
                            body: JSON.stringify({
                                username: username,
                            }),
                        }).then((res) => res.json()).then((data) => {
                            if (data.error) {
                                toast.error(data.error);
                            }
                            toast.dismiss();
                            toast.success("User deleted!");
                            router.push(`/`);
                        }).catch((e) => {
                            toast.dismiss();
                            toast.error("An error occurred! " + e);
                        });
                    }} disabled={(confirmationText !== username) || !understood || loading}>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}