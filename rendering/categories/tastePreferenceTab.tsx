"use client";
import { getS3ImageUrl } from "@/lib/s3-utils";

import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import { Input } from "@/components/ui/input";
import {
  Plus,
  GripVertical,
  Loader2,
  Search,
  X,
  Trash2,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { EntityDeleteModal } from "./entityDeleteModal";
import { EntityFormModal } from "./entityFormModal";
import { useTastePreferenceStore } from "@/store/tastePreferenceStore";
import { useDebounce } from "@/hooks/use-debounce";
import type { TastePreference } from "@/services/taste-preference.service";

export function TastePreferenceTab() {
  const {
    tastePreferences,
    isLoading,
    fetchTastePreferences,
    reorderTastePreferences,
    limit,
    history,
    nextCursor,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    search,
    setFilters,
    deleteTastePreference,
    toggleTastePreferenceActive,
  } = useTastePreferenceStore(
    useShallow((state) => ({
      tastePreferences: state.tastePreferences,
      isLoading: state.isLoading,
      fetchTastePreferences: state.fetchTastePreferences,
      reorderTastePreferences: state.reorderTastePreferences,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      setLimit: state.setLimit,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      search: state.search,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      deleteTastePreference: state.deleteTastePreference,
      toggleTastePreferenceActive: state.toggleTastePreferenceActive,
    }))
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tastePreferenceToEdit, setTastePreferenceToEdit] = useState<TastePreference | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tastePreferenceToDelete, setTastePreferenceToDelete] = useState<TastePreference | null>(null);

  const handleDeleteConfirm = async () => {
    if (!tastePreferenceToDelete) return;
    try {
      await deleteTastePreference(tastePreferenceToDelete.id);
      toast.success(`Taste Preference "${tastePreferenceToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setTastePreferenceToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to delete taste preference");
    }
  };

  const [searchVal, setSearchVal] = useState(search);
  const debouncedSearch = useDebounce(searchVal, 300);

  useEffect(() => {
    fetchTastePreferences();
  }, [fetchTastePreferences]);

  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, setFilters]);

  const handleDrop = async (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const currentDragIndex = dragIndex;
    setDragIndex(null);

    try {
      await reorderTastePreferences(currentDragIndex, dropIndex);
    } catch (err) {
      console.error("Failed to update sort order:", err);
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    return getS3ImageUrl(imagePath);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Taste Preference Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage flavor profiles & spice levels (Spicy, Sweet, Tangy, etc.)</p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#2d7a4f] hover:bg-[#236040] text-white gap-1.5 font-semibold cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Taste Preference
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search taste preferences..."
            className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4 w-16">Icon</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                    Loading taste preferences…
                  </td>
                </tr>
              ) : tastePreferences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No taste preferences found.
                  </td>
                </tr>
              ) : (
                tastePreferences.map((tp, idx) => (
                  <tr
                    key={tp.id}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(idx)}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing" />
                        <span className="text-xs font-mono text-muted-foreground">{tp.sortOrder}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-10 w-10 rounded-lg border border-border/60 bg-muted/30 overflow-hidden flex items-center justify-center">
                        {(tp.iconUrl || tp.imageUrl || tp.icon) ? (
                          <img
                            src={getImageUrl(tp.iconUrl || tp.imageUrl || tp.icon) || ""}
                            alt={tp.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground uppercase">{tp.name.substring(0, 2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {tp.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {tp.slug}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge value={tp.active ? "Active" : "Disabled"} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTastePreferenceToEdit(tp);
                            setEditDialogOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTastePreferenceActive(tp.id, !tp.active)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title={tp.active ? "Disable" : "Enable"}
                        >
                          {tp.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTastePreferenceToDelete(tp);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
      </div>

      <EntityFormModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entityType="tastePreference"
        mode="create"
        nextSortOrder={tastePreferences.length + 1}
        onSuccess={() => fetchTastePreferences()}
      />

      <EntityFormModal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entityType="tastePreference"
        mode="edit"
        initialData={tastePreferenceToEdit}
        onSuccess={() => fetchTastePreferences()}
      />

      <EntityDeleteModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entityType="tastePreference"
        entityName={tastePreferenceToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
