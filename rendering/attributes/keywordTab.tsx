"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Edit, Trash2, X, Loader2, MoreVertical, CheckCircle2, Ban } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
                <th className="py-3 px-4">Active</th>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-40 p-1">
                          <button
                            onClick={() => setEditItem(item)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-foreground cursor-pointer rounded-md"
                          >
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            Edit
                          </button>
                          
                          {item.active ? (
                            <button
                              onClick={async () => {
                                try {
                                  await keywordService.updateKeyword(item.id, { active: false });
                                  toast.success("Marked as inactive");
                                  fetchKeywords(search, history.length > 0 ? history[history.length - 1] : undefined, limit);
                                } catch (err: any) {
                                  toast.error(err?.response?.data?.message || "Failed to update");
                                }
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-amber-600 hover:text-amber-700 cursor-pointer rounded-md"
                            >
                              <Ban className="h-3.5 w-3.5 text-amber-600" />
                              Mark Inactive
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await keywordService.updateKeyword(item.id, { active: true });
                                  toast.success("Marked as active");
                                  fetchKeywords(search, history.length > 0 ? history[history.length - 1] : undefined, limit);
                                } catch (err: any) {
                                  toast.error(err?.response?.data?.message || "Failed to update");
                                }
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-emerald-600 hover:text-emerald-700 cursor-pointer rounded-md"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Mark Active
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteItem(item)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-destructive hover:text-destructive cursor-pointer rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            Delete
                          </button>
                        </PopoverContent>
                      </Popover>
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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<z.infer<typeof keywordSchema>>({
    resolver: zodResolver(keywordSchema),
    defaultValues: { name: "", active: true },
  });

  useEffect(() => {
    if (isOpen) reset({ name: "", active: true });
  }, [isOpen, reset]);

  const onSubmit = async (data: z.infer<typeof keywordSchema>) => {
    try {
      const existing = await keywordService.getKeywords({ search: data.name });
      const duplicate = existing.data?.items?.find((i: Keyword) => i.name.toLowerCase() === data.name.toLowerCase());
      if (duplicate) {
        setError("name", { type: "manual", message: "A keyword with this name already exists" });
        return;
      }

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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<{ name: string }>({
    defaultValues: { name: item.name },
  });

  useEffect(() => {
    if (isOpen) reset({ name: item.name });
  }, [isOpen, item, reset]);

  const onSubmit = async (data: { name: string }) => {
    try {
      const existing = await keywordService.getKeywords({ search: data.name });
      const duplicate = existing.data?.items?.find((i: Keyword) => i.name.toLowerCase() === data.name.toLowerCase() && i.id !== item.id);
      if (duplicate) {
        setError("name", { type: "manual", message: "A keyword with this name already exists" });
        return;
      }

      await keywordService.updateKeyword(item.id, { name: data.name });
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
            <Input {...register("name")} required />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
