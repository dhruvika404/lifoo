"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Edit, Trash2, X, Loader2 } from "lucide-react";
import { TablePagination } from "@/components/tablePagination";
import { keywordService, Keyword } from "@/services/keyword.service";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const keywordSchema = z.object({
  name: z.string().min(1, "Name is required"),
  active: z.boolean(),
});

type KeywordFormValues = z.infer<typeof keywordSchema>;

export function KeywordTab() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Keyword | null>(null);
  const [deleteItem, setDeleteItem] = useState<Keyword | null>(null);

  const fetchKeywords = async (q = search, cursor?: string, overrideLimit = limit) => {
    setLoading(true);
    try {
      const res = await keywordService.getKeywords({ search: q, limit: overrideLimit, cursor });
      setKeywords(res.data?.items || []);
      setNextCursor(res.data?.nextCursor || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load keywords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory([]);
      fetchKeywords(search, undefined, limit);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, limit]);

  // Handle pagination
  const handlePageChange = async (page: number) => {
    if (page > history.length + 1 && nextCursor) {
      setHistory([...history, nextCursor]);
      await fetchKeywords(search, nextCursor, limit);
    } else if (page < history.length + 1 && history.length > 0) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      const prevCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
      await fetchKeywords(search, prevCursor, limit);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Keywords Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage master list of keywords</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchKeywords()}
            variant="outline"
            disabled={loading}
            className="border-border/60 text-foreground hover:bg-muted gap-1.5 font-medium cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-[#2d7a4f] hover:bg-[#236040] text-white gap-1.5 font-semibold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Keyword
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords..."
            className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
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
                <th className="py-3 px-4">Keyword</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && keywords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                    Loading keywords...
                  </td>
                </tr>
              ) : keywords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    No keywords found.
                  </td>
                </tr>
              ) : (
                keywords.map((item) => (
                  <tr key={item.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground text-sm">{item.name}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{item.slug}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${item.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditItem(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteItem(item)}
                          className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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
          onPageChange={handlePageChange}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setHistory([]);
            fetchKeywords(search, undefined, newLimit);
          }}
          totalItems={undefined}
        />
      </div>

      {/* Add Modal */}
      <AddKeywordModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          setIsAddOpen(false);
          fetchKeywords(search, undefined, limit);
        }}
      />

      {/* Edit Modal */}
      {editItem && (
        <EditKeywordModal
          isOpen={!!editItem}
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            setEditItem(null);
            fetchKeywords(search, history.length > 0 ? history[history.length - 1] : undefined, limit);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Keyword</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground/80">
              Are you sure you want to delete keyword <span className="font-semibold text-foreground">"{deleteItem?.name}"</span>?
            </p>
            <p className="text-xs text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteItem) return;
                try {
                  await keywordService.deleteKeyword(deleteItem.id);
                  toast.success("Keyword deleted successfully");
                  setDeleteItem(null);
                  fetchKeywords(search, undefined, limit);
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || "Failed to delete keyword");
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function AddKeywordModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<z.infer<typeof keywordSchema>>({
    resolver: zodResolver(keywordSchema),
    defaultValues: { name: "", active: true },
  });

  useEffect(() => {
    if (isOpen) reset({ name: "", active: true });
  }, [isOpen, reset]);

  const onSubmit = async (data: z.infer<typeof keywordSchema>) => {
    try {
      await keywordService.createKeyword(data);
      toast.success("Keyword created");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create keyword");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Keyword</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} placeholder="e.g. Best Seller" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="add-active" {...register("active")} className="rounded border-gray-300 text-[#2d7a4f] focus:ring-[#2d7a4f]" />
            <label htmlFor="add-active" className="text-sm">Active</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditKeywordModal({ isOpen, item, onClose, onSuccess }: { isOpen: boolean; item: Keyword; onClose: () => void; onSuccess: () => void }) {
  // We only allow updating the active status based on the API payload provided, 
  // but we can show the name as read-only.
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<{ active: boolean }>({
    defaultValues: { active: item.active },
  });

  useEffect(() => {
    if (isOpen) reset({ active: item.active });
  }, [isOpen, item, reset]);

  const onSubmit = async (data: { active: boolean }) => {
    try {
      await keywordService.updateKeyword(item.id, { active: data.active });
      toast.success("Keyword updated");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update keyword");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Keyword</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={item.name} disabled className="bg-muted" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="edit-active" {...register("active")} className="rounded border-gray-300 text-[#2d7a4f] focus:ring-[#2d7a4f]" />
            <label htmlFor="edit-active" className="text-sm">Active</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
