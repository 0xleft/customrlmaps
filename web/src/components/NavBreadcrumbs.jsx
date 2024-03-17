import { DividerVerticalIcon, SlashIcon } from "@radix-ui/react-icons"
import { BreadcrumbPage } from "@/components/ui/breadcrumb"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useRouter } from "next/router"
import Link from "next/link"
 
export function NavBreadcrumbs() {

    if (typeof window === "undefined") return null;

    const path = window.location.pathname;
    const pathArray = path.split("/").filter((item) => item !== "");
    if (pathArray.length === 0) return null;

    return (
        <Breadcrumb>
        <BreadcrumbList>
            {pathArray.map((item, index) => {
                if (item === "") return null;
                return (
                    <BreadcrumbItem key={index}>
                        <BreadcrumbSeparator>
                            <SlashIcon />
                        </BreadcrumbSeparator>
                        <BreadcrumbLink asChild>
                            <Link href={`/${pathArray.slice(0, index + 1).join("/")}`}>
                                {item}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                )
            })}
        </BreadcrumbList>
        </Breadcrumb>
    )
}