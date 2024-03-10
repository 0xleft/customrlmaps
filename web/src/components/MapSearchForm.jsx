"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const MapSearchForm = () => {
    const router = useRouter();
    
    const formSchema = z.object({
        query: z.string().min(1, {
            message: "Query must not be empty",
        }),
    })
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
          query: "",
        },
    });
    
    function onSubmit(values) {
        router.push({
            pathname: "/search",
            query: { query: values.query },
        });
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row space-x-1">
            <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input placeholder="Search..." {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <Button variant="outline">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            </Button>
            </form>
        </Form>
    );
}

export default MapSearchForm;