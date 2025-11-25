"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

export function Combobox({
  options,
  itemName,
  value,
  onValueChange,
  isLoading,
  ariaInvalid,
}: {
  options: string[];
  itemName: string;
  value: string;
  onValueChange: (value: string) => void;
  isLoading?: boolean;
  ariaInvalid: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          aria-invalid={ariaInvalid}
        >
          {isLoading ? "Loading..." : value}
          {isLoading ? (
            <Spinner />
          ) : (
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {Array.isArray(options) && options.length > 0 && (
            <CommandInput placeholder={`Search ${itemName}...`} />
          )}
          <CommandList>
            <CommandEmpty>No {itemName} found.</CommandEmpty>
            <CommandGroup defaultValue="empty">
              {Array.isArray(options) && options.length > 0 ? (
                options.map((option, index) => (
                  <CommandItem
                    key={`${option}-${index}`}
                    value={option}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled value="empty">
                  No options available
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
