import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const removeOption = (value: string, e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(selected.filter((v) => v !== value));
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
          tabIndex={0}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 mr-2 text-left">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground py-0.5">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold z-10"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(option.value, e)}
                    onPointerDown={(e) => removeOption(option.value, e)}
                    className="hover:bg-emerald-500/20 rounded-full p-0.5 transition-colors cursor-pointer inline-flex items-center justify-center ml-1"
                    aria-label={`Remove ${option.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar p-1">
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              No options available
            </div>
          )}
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleOption(option.value);
                }}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                  isSelected
                    ? "bg-emerald-500/10 text-emerald-700 font-medium"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
