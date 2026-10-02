"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  StatusBadge
} from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MoreVertical, 
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
import { nutritionService, Nutrition } from "@/services/nutrition.service";

// --- Schema ---
const nutritionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  defaultUnit: z.string().min(1, "Default unit is required"),
  displayOrder: z.number().optional(),
  icon: z.string().optional(),
});
type NutritionFormValues = z.infer<typeof nutritionSchema>;

export function NutritionTab() {
  const [nutritions, setNutritions] = useState<Nutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [limit, setLimit] = useState(10);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Nutrition | null>(null);
  const [deleteItem, setDeleteItem] = useState<Nutrition | null>(null);
  const [uploadItem, setUploadItem] = useState<Nutrition | null>(null);

  const fetchNutritions = async (q = search, cursor?: string, overrideLimit = limit) => {
    setLoading(true);
    try {
      const res = await nutritionService.getNutritions({ search: q, limit: overrideLimit, cursor });
      setNutritions(res.data?.items || []);
      setNextCursor(res.data?.nextCursor || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load nutritions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory([]);
      fetchNutritions(search, undefined, limit);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Nutritions Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage master list of nutritional elements</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchNutritions()}
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
            New Nutrition
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nutritions..."
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
                <th className="py-3 px-4">Nutrition</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-center">Sort Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && nutritions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2d7a4f] mb-2" />
                    Loading nutritions...
                  </td>
                </tr>
              ) : nutritions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No nutritions found.
                  </td>
                </tr>
              ) : (
                nutritions.map((item) => (
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
                    <td className="py-3 px-4 text-foreground/80 font-medium text-sm">{item.defaultUnit}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-mono text-muted-foreground">{item.sortOrder}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge value={item.status} />
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
              await fetchNutritions(search, nextCursor);
            } else if (page < history.length + 1 && history.length > 0) {
              const newHistory = [...history];
              newHistory.pop();
              setHistory(newHistory);
              const previousCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
              await fetchNutritions(search, previousCursor);
            }
          }}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setHistory([]);
            fetchNutritions(search, undefined, newLimit);
          }}
          totalItems={undefined}
        />
      </div>

      <AddNutritionModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={() => fetchNutritions()} 
      />
      
      {editItem && (
        <EditNutritionModal 
          item={editItem} 
          isOpen={!!editItem} 
          onClose={() => setEditItem(null)} 
          onSuccess={() => fetchNutritions()} 
        />
      )}

      {deleteItem && (
        <DeleteNutritionModal 
          item={deleteItem} 
          isOpen={!!deleteItem} 
          onClose={() => setDeleteItem(null)} 
          onSuccess={() => fetchNutritions()} 
        />
      )}

      {uploadItem && (
        <UploadIconModal 
          item={uploadItem} 
          isOpen={!!uploadItem} 
          onClose={() => setUploadItem(null)} 
          onSuccess={() => fetchNutritions()} 
        />
      )}
    </div>
  );
}

function AddNutritionModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: { name: "", defaultUnit: "g", displayOrder: 0, icon: "" }
  });

  useEffect(() => { if (isOpen) reset(); }, [isOpen, reset]);

  const onSubmit = async (values: NutritionFormValues) => {
    try {
      await nutritionService.createNutrition(values);
      toast.success("Nutrition created");
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
          <DialogTitle>Add Nutrition</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} placeholder="e.g. Protein" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Unit</label>
            <Input {...register("defaultUnit")} placeholder="e.g. g, mg, kcal" />
            {errors.defaultUnit && <p className="text-xs text-destructive">{errors.defaultUnit.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Order</label>
            <Input type="number" {...register("displayOrder", { valueAsNumber: true })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditNutritionModal({ item, isOpen, onClose, onSuccess }: { item: Nutrition; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(item.name);
  const [status, setStatus] = useState(item.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await nutritionService.updateNutrition(item.id, { name, status });
      toast.success("Nutrition updated");
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
          <DialogTitle>Edit Nutrition</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteNutritionModal({ item, isOpen, onClose, onSuccess }: { item: Nutrition; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onConfirm = async () => {
    setIsSubmitting(true);
    try {
      await nutritionService.deleteNutrition(item.id);
      toast.success("Nutrition deleted");
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
          <DialogTitle>Delete Nutrition</DialogTitle>
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

function UploadIconModal({ item, isOpen, onClose, onSuccess }: { item: Nutrition; isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await nutritionService.getUploadUrl(file.type, item.id);
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
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
