"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  StatusBadge
} from "@/components/pageShell";
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
  X
} from "lucide-react";
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
import toast from "react-hot-toast";
import { ingredientService, Ingredient } from "@/services/ingredient.service";

// --- Schema ---
const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean(),
});
type IngredientFormValues = z.infer<typeof ingredientSchema>;

export function IngredientTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Ingredient | null>(null);
  const [deleteItem, setDeleteItem] = useState<Ingredient | null>(null);
  const [uploadItem, setUploadItem] = useState<Ingredient | null>(null);

  const fetchIngredients = async (q = search, cursor?: string, overrideLimit = limit) => {
    setLoading(true);
    try {
      const res = await ingredientService.getIngredients({ search: q, limit: overrideLimit, cursor, createdAt: "asc" });
      setIngredients(res.data?.items || []);
      setNextCursor(res.data?.nextCursor || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory([]);
      fetchIngredients(search, undefined, limit);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ingredients Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage master list of ingredients</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchIngredients()}
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
            New Ingredient
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients..."
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
                <th className="py-3 px-4">Ingredient</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Sort Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && ingredients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                    Loading ingredients...
                  </td>
                </tr>
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No ingredients found.
                  </td>
                </tr>
              ) : (
                ingredients.map((item) => (
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
                        <div>
                          <div className="font-semibold text-foreground text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground/80 font-medium text-xs max-w-[200px] truncate" title={item.description || ""}>
                      {item.description || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-mono text-muted-foreground">{item.sortOrder}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge value={item.status} />
                      <div className="mt-1">
                         <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                           {item.isActive ? "Active" : "Inactive"}
                         </span>
                      </div>
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
                          onClick={() => setUploadItem(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title="Upload Icon"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteItem(item)}
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
            if (page > history.length + 1 && nextCursor) {
              setHistory([...history, nextCursor]);
              await fetchIngredients(search, nextCursor);
            } else if (page < history.length + 1 && history.length > 0) {
              const newHistory = [...history];
              newHistory.pop();
              setHistory(newHistory);
              const previousCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
              await fetchIngredients(search, previousCursor);
            }
          }}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setHistory([]);
            fetchIngredients(search, undefined, newLimit);
          }}
          totalItems={undefined}
        />
      </div>

      <AddIngredientModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={() => fetchIngredients()} 
      />
      
      {editItem && (
        <EditIngredientModal 
          item={editItem} 
          isOpen={!!editItem} 
          onClose={() => setEditItem(null)} 
          onSuccess={() => fetchIngredients(search, history.length > 0 ? history[history.length - 1] : undefined)} 
        />
      )}

      {deleteItem && (
        <DeleteIngredientModal 
          item={deleteItem} 
          isOpen={!!deleteItem} 
          onClose={() => setDeleteItem(null)} 
          onSuccess={() => fetchIngredients(search, undefined)} 
        />
      )}

      {uploadItem && (
        <UploadIconModal 
          item={uploadItem} 
          isOpen={!!uploadItem} 
          onClose={() => setUploadItem(null)} 
          onSuccess={() => fetchIngredients(search, history.length > 0 ? history[history.length - 1] : undefined)} 
        />
      )}

    </div>
  );
}

function AddIngredientModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: { name: "", slug: "", description: "", sortOrder: 0, isActive: true }
  });

  // Auto-generate slug from name
  const name = watch("name");
  useEffect(() => {
    if (name) {
      setValue("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  }, [name, setValue]);

  useEffect(() => { if (isOpen) reset(); }, [isOpen, reset]);

  const onSubmit = async (values: z.infer<typeof ingredientSchema>) => {
    try {
      await ingredientService.createIngredient(values);
      toast.success("Ingredient created");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Ingredient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} placeholder="e.g. Organic Honey" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input {...register("slug")} placeholder="organic-honey" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea {...register("description")} placeholder="e.g. 100% Pure Raw Forest Honey" className="resize-none" rows={2} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort Order</label>
            <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="add-active" {...register("isActive")} className="rounded border-gray-300 text-[#2d7a4f] focus:ring-[#2d7a4f]" />
            <label htmlFor="add-active" className="text-sm font-medium">Active</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditIngredientModal({ item, isOpen, onClose, onSuccess }: { item: Ingredient; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [status, setStatus] = useState(item.status);
  const [isActive, setIsActive] = useState(item.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ingredientService.updateIngredient(item.id, { name, description, status, isActive });
      toast.success("Ingredient updated");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="edit-active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-gray-300 text-[#2d7a4f] focus:ring-[#2d7a4f]" />
            <label htmlFor="edit-active" className="text-sm font-medium">Active</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteIngredientModal({ item, isOpen, onClose, onSuccess }: { item: Ingredient; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onConfirm = async () => {
    setIsSubmitting(true);
    try {
      await ingredientService.deleteIngredient(item.id);
      toast.success("Ingredient deleted");
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
          <DialogTitle>Delete Ingredient</DialogTitle>
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

function UploadIconModal({ item, isOpen, onClose, onSuccess }: { item: Ingredient; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await ingredientService.getUploadUrl(file.type, item.id);
      const data = res?.data || res;
      if (!data?.presignedUrl) throw new Error("No upload URL returned");

      const uploadRes = await fetch(data.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("S3 upload failed");

      toast.success("Icon uploaded successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload icon");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Icon - {item.name}</DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden">
            {item.icon ? (
              <img src={item.icon} alt={item.name} className="h-full w-full object-contain p-2" />
            ) : (
              <Scale className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="w-full max-w-xs"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
            {uploading ? "Uploading..." : "Select New Image"}
          </Button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
