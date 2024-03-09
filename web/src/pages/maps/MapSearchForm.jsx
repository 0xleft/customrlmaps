"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
        // todo
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            </form>
        </Form>
    );
}

export default MapSearchForm;