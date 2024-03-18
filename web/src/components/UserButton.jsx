import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function UserButton({ session }) {

    const router = useRouter();

    // fetch image from api
    const [imageUrl, setImageUrl] = useState(null);
    useEffect(() => {
        fetch("/api/user/myimage").then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setImageUrl(data.imageUrl);
                });
            }
        });
    }, []);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="hover:cursor-pointer">
                        <AvatarImage src={imageUrl} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => router.push("/profile")}
                        >Profile</DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => router.push("/projects")}
                        >Projects</DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => router.push("/user")}
                        >Settings</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/api/auth/signout")}>
                    Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
        </>
    );
}