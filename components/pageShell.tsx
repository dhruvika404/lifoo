import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b bg-card px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Toolbar({ placeholder = "Search...", right }: { placeholder?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card px-6 py-3">
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={placeholder} className="pl-9 h-9" />
      </div>
      <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filters</Button>
      <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
      {right}
    </div>
  );
}

export function StatusBadge({ value }: { value?: string }) {
  const v = (value || "").toLowerCase();
  
  if (/(active|approved|live|resolved|delivered|verified|processed|sent|completed|healthy|available)/.test(v)) {
    return (
      <Badge variant="default" className="capitalize font-medium px-2 py-0.5 border shadow-none hover:bg-opacity-80 transition-all bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 whitespace-nowrap">
        {value || "Unknown"}
      </Badge>
    );
  }

  if (/(pending|draft|open|scheduled|under review|in progress|cooking|out for delivery|placed|returning)/.test(v)) {
    return (
      <Badge variant="secondary" className="capitalize font-medium px-2 py-0.5 border shadow-none hover:bg-opacity-80 transition-all bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 whitespace-nowrap">
        {value || "Unknown"}
      </Badge>
    );
  }

  if (/(suspended|blocked|rejected|cancelled|failed|expired|degraded|on hold|offline|inactive|disabled)/.test(v)) {
    return (
      <Badge variant="destructive" className="capitalize font-medium px-2 py-0.5 border shadow-none hover:bg-opacity-80 transition-all bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 whitespace-nowrap">
        {value || "Unknown"}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="capitalize font-medium px-2 py-0.5 border shadow-none hover:bg-opacity-80 transition-all bg-muted/50 text-muted-foreground border-border/50 whitespace-nowrap">
      {value || "Unknown"}
    </Badge>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns, rows,
}: {
  columns: { key: keyof T | string; label: string; render?: (row: T) => ReactNode; className?: string }[];
  rows: T[];
}) {
  return (
    <div className="rounded-lg border bg-card overflow-visible">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            {columns.map((c) => (
              <TableHead key={String(c.key)} className={c.className}>{c.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((c) => (
                <TableCell key={String(c.key)} className={c.className}>
                  {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function StatCard({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <Card className={accent ? "border-primary/30" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-1 flex-col gap-4 p-6 ${className || ""}`}>{children}</div>;
}
