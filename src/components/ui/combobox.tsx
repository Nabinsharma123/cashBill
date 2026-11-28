import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

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
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string | number;
  label: string;
  description?: string;
  keywords?: string[];
  disabled?: boolean;
}

export interface ComboboxProps {
  value?: string | number | null;
  onChange?: (value: string | number, option?: ComboboxOption) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  allowClear?: boolean;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder = "Select...",
      searchPlaceholder = "Search...",
      emptyText = "No results found.",
      disabled = false,
      className,
      contentClassName,
      allowClear = false,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    // Find the currently selected option
    const selectedOption = React.useMemo(() => {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(value)
      ) {
        return undefined;
      }
      return options.find((opt) => String(opt.value) === String(value));
    }, [options, value]);

    const handleSelect = (option: ComboboxOption) => {
      onChange?.(option.value, option);
      setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(typeof value === "number" ? (NaN as any) : "");
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal text-left px-3 h-9",
              !selectedOption && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate flex-1">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {allowClear && selectedOption && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 w-[--radix-popover-trigger-width] min-w-[260px]",
            contentClassName,
          )}
          align="start"
        >
          <Command
            filter={(_itemValue, search, keywords) => {
              const normalizedSearch = search.toLowerCase().trim();
              if (!normalizedSearch) return 1;
              const haystack = (keywords || []).join(" ").toLowerCase();
              return haystack.includes(normalizedSearch) ? 1 : 0;
            }}
          >
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected =
                    selectedOption &&
                    String(selectedOption.value) === String(option.value);
                  const searchKeywords = [
                    option.label,
                    option.description || "",
                    ...(option.keywords || []),
                  ].filter(Boolean);

                  return (
                    <CommandItem
                      key={String(option.value)}
                      value={String(option.value)}
                      keywords={searchKeywords}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option)}
                      className="flex items-center justify-between py-2 px-2.5 cursor-pointer"
                    >
                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <span className="text-sm font-medium leading-snug truncate">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground leading-normal truncate mt-0.5">
                            {option.description}
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 text-primary",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

Combobox.displayName = "Combobox";

export default Combobox;
