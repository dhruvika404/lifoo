"use client";

import React, { useState, useEffect, useRef } from "react";
import { TablePagination } from "@/components/tablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Scale,
  X,
  MoreVertical,
  CheckCircle2,
  Ban
} from "lucide-react";
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
import toast from "react-hot-toast";
import { tagService, Tag } from "@/services/tag.service";

// --- Schema ---
const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean(),
});
type TagFormValues = z.infer<typeof tagSchema>;

export function TagTab() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Tag | null>(null);
  const [deleteItem, setDeleteItem] = useState<Tag | null>(null);

  const fetchTags = async (q = search, cursor?: string, overrideLimit = limit) => {
    setLoading(true);
    try {
      const res = await tagService.getTags({ search: q, limit: overrideLimit, cursor, createdAt: "asc" });
      setTags(res.data?.items || []);
      setNextCursor(res.data?.nextCursor || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory([]);
      fetchTags(search, undefined, limit);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tags Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage master list of tags</p>
        </div>

        <div className="flex items-center gap-3">

          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#2d7a4f] hover:bg-[#236040] text-white gap-1.5 font-semibold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Tag
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
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
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && tags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                    Loading tags...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No tags found.
                  </td>
                </tr>
              ) : (
                tags.map((item) => (
                  <tr key={item.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border border-border/60 overflow-hidden shrink-0">
                          {item.icon ? (
                            <img src={item.icon} alt={item.name} className="h-full w-full object-contain p-1" />
                          ) : (
                            <Scale className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="font-semibold text-foreground text-sm">{item.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{item.slug}</td>
                    <td className="py-3 px-4 text-foreground/80 font-medium text-xs max-w-[200px] truncate" title={item.description || ""}>
                      {item.description || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${item.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                        {item.isActive ? "Active" : "Inactive"}
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
                          
                          {item.isActive ? (
                            <button
                              onClick={async () => {
                                try {
                                  await tagService.updateTag(item.id, { isActive: false });
                                  toast.success("Marked as inactive");
                                  fetchTags(search, history.length > 0 ? history[history.length - 1] : undefined, limit);
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
                                  await tagService.updateTag(item.id, { isActive: true });
                                  toast.success("Marked as active");
                                  fetchTags(search, history.length > 0 ? history[history.length - 1] : undefined, limit);
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
          onPageChange={async (page) => {
            if (page > history.length + 1 && nextCursor) {
              setHistory([...history, nextCursor]);
              await fetchTags(search, nextCursor);
            } else if (page < history.length + 1 && history.length > 0) {
              const newHistory = [...history];
              newHistory.pop();
              setHistory(newHistory);
              const previousCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
              await fetchTags(search, previousCursor);
            }
          }}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setHistory([]);
            fetchTags(search, undefined, newLimit);
          }}
          totalItems={undefined}
        />
      </div>

      <AddTagModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={() => fetchTags()} 
      />
      
      {editItem && (
        <EditTagModal 
          item={editItem} 
          isOpen={!!editItem} 
          onClose={() => setEditItem(null)} 
          onSuccess={() => fetchTags(search, history.length > 0 ? history[history.length - 1] : undefined)} 
        />
      )}

      {deleteItem && (
        <DeleteTagModal 
          item={deleteItem} 
          isOpen={!!deleteItem} 
          onClose={() => setDeleteItem(null)} 
          onSuccess={() => fetchTags(search, undefined)} 
        />
      )}

    </div>
  );
}


function AddTagModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: "", description: "", isActive: true },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);



  useEffect(() => { 
    if (isOpen) {
      reset();
      setSelectedFile(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: z.infer<typeof tagSchema>) => {
    setIsUploading(true);
    try {
      const existing = await tagService.getTags({ search: values.name });
      const duplicate = existing.data?.items?.find((i: Tag) => i.name.toLowerCase() === values.name.toLowerCase());
      if (duplicate) {
        setError("name", { type: "manual", message: "A tag with this name already exists" });
        setIsUploading(false);
        return;
      }

      const created = await tagService.createTag(values);
      const createdId = created.data?.id || (created as any).id;
      
      if (selectedFile && createdId) {
        const res = await tagService.getUploadUrl(selectedFile.type, createdId);
        const data = res?.data || res;
        if (data?.presignedUrl) {
          await fetch(data.presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": selectedFile.type },
            body: selectedFile,
          });
        }
      }

      toast.success("Tag created");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} placeholder="e.g. Freshly Made" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea {...register("description")} placeholder="e.g. Prepared fresh daily" className="resize-none" rows={2} />
          </div>

          
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon (Optional)</label>
            <div className="flex items-center gap-4">
              <div 
                className="h-16 w-16 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-full w-full object-contain p-2" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploading}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const editTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
type EditTagFormValues = z.infer<typeof editTagSchema>;

function EditTagModal({ item, isOpen, onClose, onSuccess }: { item: Tag; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<EditTagFormValues>({
    resolver: zodResolver(editTagSchema),
    defaultValues: { name: item.name, description: item.description || "" },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      reset({ name: item.name, description: item.description || "" });
      setSelectedFile(null);
    }
  }, [isOpen, item, reset]);

  const onSubmit = async (values: EditTagFormValues) => {
    setIsUploading(true);
    try {
      const existing = await tagService.getTags({ search: values.name });
      const duplicate = existing.data?.items?.find((i: Tag) => i.name.toLowerCase() === values.name.toLowerCase() && i.id !== item.id);
      if (duplicate) {
        setError("name", { type: "manual", message: "A tag with this name already exists" });
        setIsUploading(false);
        return;
      }

      await tagService.updateTag(item.id, values);
      
      if (selectedFile) {
        const res = await tagService.getUploadUrl(selectedFile.type, item.id);
        const data = res?.data || res;
        if (data?.presignedUrl) {
          await fetch(data.presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": selectedFile.type },
            body: selectedFile,
          });
        }
      }
      
      toast.success("Tag updated");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} required />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea {...register("description")} rows={2} className="resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon (Optional)</label>
            <div className="flex items-center gap-4">
              <div 
                className="h-16 w-16 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="h-full w-full object-contain p-2" />
                ) : item.icon ? (
                  <img src={item.icon} alt="Icon" className="h-full w-full object-contain p-2" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Change File
              </Button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {isSubmitting || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTagModal({ item, isOpen, onClose, onSuccess }: { item: Tag; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onConfirm = async () => {
    setIsSubmitting(true);
    try {
      await tagService.deleteTag(item.id);
      toast.success("Tag deleted");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tag</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

