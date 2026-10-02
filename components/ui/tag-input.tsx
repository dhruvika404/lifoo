"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TagInputProps {
  /** Controlled list of tags */
  value: string[];
  /** Called whenever the tag list changes */
  onChange: (tags: string[]) => void;
  /** Placeholder shown in the text field when there are no tags */
  placeholder?: string;
  /** Extra classes for the outer container */
  className?: string;
  /** Disable the whole control */
  disabled?: boolean;
  /** ID forwarded to the hidden input (for label association) */
  id?: string;
}

/**
 * A tag-input field that renders added tags as `Badge` components and
 * provides a remove `Button` on each tag. Tags are confirmed on Enter or `,`.
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter or , to add…",
  className,
  disabled = false,
  id,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 min-h-10 rounded-lg border border-border/60 bg-background px-3 py-1.5",
        "focus-within:ring-2 focus-within:ring-[#2d7a4f]/20 focus-within:border-[#2d7a4f] transition-all",
        disabled && "opacity-60 pointer-events-none cursor-not-allowed bg-muted/30",
        className,
      )}
      onClick={() => !disabled && inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1 bg-[#2d7a4f]/10 text-[#2d7a4f] border border-[#2d7a4f]/20 font-medium text-xs px-2 py-0.5 rounded"
        >
          {tag}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="h-4 w-4 rounded-full hover:bg-[#2d7a4f]/20 text-[#2d7a4f] p-0 ml-0.5"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        disabled={disabled}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 bg-transparent min-w-[140px] text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}
