import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import * as React from 'react';

export function Combobox( { onSelect = () => {}, values = [], initialValue = "", title = "" }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(initialValue);

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            >
            {value
                ? values.find((obj) => obj.value === value)?.label
                : `Select ${title}...`}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
            <Command>
            <CommandInput placeholder={`Search ${title}...`} className="h-9" />
            <CommandEmpty>No {title} found.</CommandEmpty>
            <CommandGroup>
                {values.map((obj) => (
                <CommandItem
                    key={obj.value}
                    value={obj.value}
                    onSelect={(currentValue) => {
                        onSelect(currentValue)
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                    }}
                >
                    {obj.label}
                    <CheckIcon
                        className={cn(
                            "ml-auto h-4 w-4",
                            value === obj.value ? "opacity-100" : "opacity-0"
                        )}
                    />
                </CommandItem>
                ))}
            </CommandGroup>
            </Command>
        </PopoverContent>
        </Popover>
    )
}