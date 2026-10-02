"use client";

import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Search,
  X,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, DataTable } from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import { FilterSelect } from "@/components/FilterSelect";
import { useAuditLogStore } from "@/store/auditLogStore";
import { useDebounce } from "@/hooks/use-debounce";
import type { AuditLog } from "@/services/auditLog.service";

import {
  ActionBadge,
  ResourceTypePill,
  AuditLogDetailModal,
  formatDate,
} from "@/components/auditLogShared";

export function AuditLogsModule() {
  const {
    logs,
    isLoading,
    fetchLogs,
    setFilters,
    resetFilters,
    limit,
    history,
    nextCursor,
    goToNextPage,
    goToPreviousPage,
    search,
    actorType,
    action,
    resourceType,
    setLimit,
  } = useAuditLogStore(
    useShallow((state) => ({
      logs: state.logs,
      isLoading: state.isLoading,
      fetchLogs: state.fetchLogs,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      search: state.search,
      actorType: state.actorType,
      action: state.action,
      resourceType: state.resourceType,
      setLimit: state.setLimit,
    }))
  );

  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 400);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  const hasActiveFilters = !!(searchVal || actorType || action || resourceType);

  const handleClearFilters = () => {
    setSearchVal("");
    resetFilters();
  };

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Track all admin and system actions across the platform"
      />

      <PageBody>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-4 mt-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by actor, resource, ID..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm"
            />
            {searchVal && (
              <button
                onClick={() => {
                  setSearchVal("");
                  setFilters({ search: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div className="w-[150px]">
            <FilterSelect
              value={action || "all"}
              onValueChange={(v) => setFilters({ action: v === "all" ? "" : v })}
              placeholder="All Actions"
              options={[
                { value: "all", label: "All Actions" },
                { value: "create", label: "Create" },
                { value: "update", label: "Update" },
                { value: "delete", label: "Delete" },
                { value: "disable", label: "Disable" },
                { value: "restore", label: "Restore" },
                { value: "passwordchange", label: "Password Change" },
                { value: "block", label: "Block" },
                { value: "suspend", label: "Suspend" },
                { value: "dispute_flagged", label: "Dispute Flagged" },
                { value: "dispute_resolved", label: "Dispute Resolved" },
                { value: "admin_token_issue", label: "Admin Token Issue" },
                { value: "retry_merge", label: "Retry Merge" },
              ]}
              className="h-10 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm"
            />
          </div>

          {/* Resource Type Filter */}
          <div className="w-[160px]">
            <FilterSelect
              value={resourceType || "all"}
              onValueChange={(v) => setFilters({ resourceType: v === "all" ? "" : v })}
              placeholder="All Resources"
              options={[
                { value: "all", label: "All Resources" },
                { value: "category", label: "Category" },
                { value: "chef_address", label: "Chef Address" },
                { value: "chef_bank_account", label: "Bank Account" },
                { value: "chef_profile", label: "Chef Profile" },
                { value: "chef_document", label: "Chef Document" },
                { value: "chef_kyc_document", label: "KYC Document" },
                { value: "cuisine", label: "Cuisine" },
                { value: "customer", label: "Customer" },
                { value: "dietary_type", label: "Dietary Type" },
                { value: "food_goal", label: "Food Goal" },
                { value: "product", label: "Product" },
                { value: "promotion", label: "Promotion" },
                { value: "taste_preference", label: "Taste Preference" },
                { value: "user", label: "User" },
              ]}
              className="h-10 rounded-lg border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-sm"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 px-3 text-sm text-[#2d7a4f] hover:text-[#225c3c] hover:bg-[#2d7a4f]/5 font-semibold gap-1.5"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table / Loading / Empty */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f] mb-3" />
            <p className="text-sm font-semibold text-foreground animate-pulse">
              Fetching audit logs...
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Retrieving data from platform database.
            </p>
          </div>
        ) : (
          <>
            <DataTable
              rows={logs}
              columns={[
                {
                  key: "occurredAt",
                  label: "Timestamp",
                  render: (r) => (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(r.occurredAt)}
                    </span>
                  ),
                },
                {
                  key: "actorName",
                  label: "Actor",
                  render: (r) => (
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {r.actorName || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.actorEmail || "—"}</p>
                    </div>
                  ),
                },
                {
                  key: "action",
                  label: "Action",
                  render: (r) => <ActionBadge action={r.action} />,
                },
                {
                  key: "resourceType",
                  label: "Resource",
                  render: (r) => <ResourceTypePill type={r.resourceType} />,
                },
                {
                  key: "message",
                  label: "Message",
                  render: (r) => (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="text-xs text-foreground/80 line-clamp-2 max-w-[500px] leading-relaxed cursor-default"
                          >
                            {r.message || <span className="text-muted-foreground">—</span>}
                          </span>
                        </TooltipTrigger>
                        {r.message && (
                          <TooltipContent className="max-w-[400px] break-words whitespace-normal text-center" align="center" side="top" sideOffset={5}>
                            {r.message}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ),
                },
                {
                  key: "targetUserName",
                  label: "Target User",
                  render: (r) => (
                    <span className="text-sm text-foreground">
                      {r.targetUserName || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  ),
                },
                {
                  key: "ip",
                  label: "IP Address",
                  render: (r) => (
                    <span className="text-xs font-mono text-muted-foreground">
                      {r.ip}
                    </span>
                  ),
                },
                // {
                //   key: "actionBtn",
                //   label: "Details",
                //   className: "text-center w-[80px]",
                //   render: (r) => (
                //     <div className="flex justify-center">
                //       <Button
                //         variant="ghost"
                //         size="icon"
                //         onClick={() => setSelectedLog(r)}
                //         className="h-8 w-8 text-muted-foreground hover:text-[#2d7a4f] hover:bg-[#2d7a4f]/5 rounded-lg transition-all duration-150"
                //         title="View details"
                //       >
                //         <Eye className="h-4 w-4" />
                //       </Button>
                //     </div>
                //   ),
                // },
              ]}
            />

            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No audit logs found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try clearing filters or adjusting your search term.
                </p>
              </div>
            )}

            {/* Pagination */}
            <TablePagination
              currentPage={history.length + 1}
              totalPages={nextCursor ? history.length + 2 : history.length + 1}
              limit={limit}
              onPageChange={async (page) => {
                if (page > history.length + 1) {
                  await goToNextPage();
                } else if (page < history.length + 1) {
                  await goToPreviousPage();
                }
              }}
              onLimitChange={(val) => setLimit(val)}
            />
          </>
        )}
      </PageBody>

      {/* Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
}
