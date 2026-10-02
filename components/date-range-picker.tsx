"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  onApply?: (date: DateRange | undefined) => void
  onClear?: () => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  onApply,
  onClear,
}: DatePickerWithRangeProps) {
  const hasActions = !!(onApply || onClear)

  const [draft, setDraft] = React.useState<DateRange | undefined>(date)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setDraft(date)
  }, [date])

  const handleApply = () => {
    setDate(draft)
    onApply?.(draft)
    setOpen(false)
  }

  const handleClear = () => {
    setDraft(undefined)
  }

  const displayDate = hasActions ? date : date

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={hasActions ? open : undefined} onOpenChange={hasActions ? setOpen : undefined}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal border-border/60 h-10",
              !displayDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {displayDate?.from ? (
              displayDate.to ? (
                <>
                  {format(displayDate.from, "LLL dd, y")} –{" "}
                  {format(displayDate.to, "LLL dd, y")}
                </>
              ) : (
                format(displayDate.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={hasActions ? draft?.from : date?.from}
            selected={hasActions ? draft : date}
            onSelect={hasActions ? setDraft : setDate}
            numberOfMonths={2}
          />

          {hasActions && (
            <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2.5">
              <Button
                size="sm"
                onClick={handleApply}
                className="flex-1 h-8 bg-[#2d7a4f] hover:bg-[#225c3c] text-white text-xs font-semibold rounded-md cursor-pointer"
              >
                Apply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex-1 h-8 border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-md cursor-pointer gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
