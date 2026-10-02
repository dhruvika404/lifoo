"use client";

import { useState, useEffect } from "react";
import { Loader2, ClipboardList, Eye, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/pageShell";
import { FilterSelect } from "@/components/FilterSelect";
import {
  ActionBadge,
  ResourceTypePill,
  AuditLogDetailModal,
  formatDate,
  generateAuditSummary,
} from "@/components/auditLogShared";
import { auditLogService, type AuditLog } from "@/services/auditLog.service";
import { TablePagination } from "@/components/tablePagination";
import toast from "react-hot-toast";

export function ChefAuditLogsTab({ chefId }: { chefId: string }) {
  const [limit, setLimit] = useState(10);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState("");
  const debouncedSearch = useDebounce(searchVal, 400);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");

  const fetchLogs = async (cursor?: string) => {
    setIsLoading(true);
    try {
      const params: any = { limit, cursor };
      if (debouncedSearch) params.search = debouncedSearch;
      if (actionFilter !== "all") params.action = actionFilter;
      if (resourceTypeFilter !== "all") params.resourceType = resourceTypeFilter;

      const res = await auditLogService.getChefAuditLogs(chefId, params);
      if (res.ok) {
        setLogs(res.data.items);
        setNextCursor(res.data.nextCursor);
      } else {
        toast.error("Failed to load audit logs");
      }
    } catch (error) {
      console.error("Error fetching chef audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!chefId) return;
    setHistory([]);
    fetchLogs();
  }, [chefId, debouncedSearch, actionFilter, resourceTypeFilter, limit]);

  const goToNextPage = () => {
    if (!nextCursor) return;
    setHistory((prev) => [...prev, nextCursor]);
    fetchLogs(nextCursor);
  };

  const goToPreviousPage = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    const prevCursor = newHistory[newHistory.length - 1];
    fetchLogs(prevCursor);
  };
  const hasActiveFilters = debouncedSearch || actionFilter !== "all" || resourceTypeFilter !== "all";

  const handleClearFilters = () => {
    setSearchVal("");
    setActionFilter("all");
    setResourceTypeFilter("all");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm font-semibold text-foreground">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action or resource..."
            className="pl-9 h-9"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>

        <div className="w-[140px]">
          <FilterSelect
            value={actionFilter}
            onValueChange={setActionFilter}
            placeholder="All Actions"
            options={[
              { value: "all", label: "All Actions" },
              { value: "create", label: "Create" },
              { value: "update", label: "Update" },
              { value: "delete", label: "Delete" },
              { value: "approve", label: "Approve" },
              { value: "reject", label: "Reject" },
              { value: "resubmit", label: "Resubmit" },
              { value: "suspend", label: "Suspend" },
              { value: "set_primary", label: "Set Primary" },
            ]}
            className="h-9 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm"
          />
        </div>

        <div className="w-[160px]">
          <FilterSelect
            value={resourceTypeFilter}
            onValueChange={setResourceTypeFilter}
            placeholder="All Resources"
            options={[
              { value: "all", label: "All Resources" },
              { value: "chef_address", label: "Chef Address" },
              { value: "chef_bank_account", label: "Bank Account" },
              { value: "chef_document", label: "Chef Document" },
              { value: "chef_kyc_document", label: "KYC Document" },
              { value: "chef_profile", label: "Chef Profile" },
              { value: "user", label: "User" },
            ]}
            className="h-9 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-9 px-3 text-sm text-[#2d7a4f] hover:text-[#225c3c] hover:bg-[#2d7a4f]/5 font-semibold gap-1.5"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <DataTable
        rows={logs}
        columns={[
          {
            key: "occurredAt",
            label: "Time",
            className: "w-[180px]",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {formatDate(r.occurredAt)}
              </span>
            ),
          },
          {
            key: "action",
            label: "Action",
            className: "w-[150px]",
            render: (r) => <ActionBadge action={r.action} />,
          },
          {
            key: "resourceType",
            label: "Resource",
            className: "w-[200px]",
            render: (r) => <ResourceTypePill type={r.resourceType} />,
          },
          {
            key: "description",
            label: "Description",
            render: (r) => (
              <span
                className="text-xs text-foreground/80 line-clamp-2 max-w-[240px] leading-relaxed"
                title={generateAuditSummary(r)}
              >
                {generateAuditSummary(r)}
              </span>
            ),
          },
          {
            key: "ip",
            label: "IP Address",
            className: "w-[130px]",
            render: (r) => (
              <span className="text-xs font-mono text-muted-foreground">
                {r.ip}
              </span>
            ),
          },
          {
            key: "actionBtn",
            label: "Details",
            className: "text-center w-[80px]",
            render: (r) => (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedLog(r)}
                  className="h-8 w-8 text-muted-foreground hover:text-[#2d7a4f] hover:bg-[#2d7a4f]/5 rounded-lg transition-all duration-150"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {logs.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm font-semibold text-foreground">No audit logs found</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This chef hasn't generated any logs yet.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      <TablePagination
        currentPage={history.length + 1}
        totalPages={nextCursor ? history.length + 2 : history.length + 1}
        limit={limit}
        onPageChange={async (page) => {
          if (page > history.length + 1) {
            goToNextPage();
          } else if (page < history.length + 1) {
            goToPreviousPage();
          }
        }}
        onLimitChange={(val) => {
          setLimit(val);
          setHistory([]);
          setNextCursor(null);
        }}
      />

      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
