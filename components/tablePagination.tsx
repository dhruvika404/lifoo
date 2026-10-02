import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  totalItems?: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  totalItems,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t px-6 py-3 bg-muted/20">
      <div className="flex items-center gap-3">
        <span className="text-xs sm:text-sm text-muted-foreground font-medium">Rows per page:</span>
        <Select
          value={String(limit)}
          onValueChange={(val) => onLimitChange(Number(val))}
        >
          <SelectTrigger className="w-[80px] h-8 text-xs font-semibold bg-background">
            <SelectValue placeholder={String(limit)} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={String(size)} className="text-xs font-medium">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {totalItems !== undefined && (
          <span className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:inline-block">
            Total items: <span className="text-foreground font-semibold">{totalItems}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
          Page <span className="text-foreground font-semibold">{currentPage}</span> of{" "}
          <span className="text-foreground font-semibold">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 transition-colors"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 transition-colors"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || totalPages === 0}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
