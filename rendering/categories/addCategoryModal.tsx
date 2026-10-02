"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, AlertCircle, X, Upload } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryService } from "@/services";

const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(1, "Slug is required"),
  sortOrder: z.number().int("Sort order must be an integer").min(1, "Sort order must be at least 1"),
  complianceRegime: z.string().min(1, "Compliance regime is required"),
  parentId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;
type UploadStatus = "idle" | "fetching-url" | "uploading" | "done" | "error";
type UploadMeta = { categoryId: string; presignedUrl: string; s3Key: string };
type Category = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AddCategoryModal({ open, onOpenChange, onCreated }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile]           = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]               = useState<string | null>(null);
  const [uploadMeta, setUploadMeta]               = useState<UploadMeta | null>(null);
  const [uploadStatus, setUploadStatus]           = useState<UploadStatus>("idle");
  const [uploadError, setUploadError]             = useState<string | null>(null);
  const [categories, setCategories]               = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      sortOrder: 1,
      complianceRegime: "fssai_basic",
      parentId: null,
      tags: [],
    },
  });

  const nameValue = watch("name");
  const tagsValue = watch("tags") || [];



  useEffect(() => {
    const slug = nameValue
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setValue("slug", slug, { shouldValidate: !!nameValue });
  }, [nameValue, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadMeta(null);
      setUploadStatus("idle");
      setUploadError(null);
      setCategories([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setCategoriesLoading(true);
    categoryService
      .getCategories({ limit: 100, parentId: "null" })
      .then((res) => {
        let items: Category[] = [];
        if (res?.data) {
          if (Array.isArray(res.data)) {
            items = res.data;
          } else if (typeof res.data === "object" && "items" in res.data) {
            items = res.data.items;
          }
        }
        setCategories(items);
        setValue("sortOrder", items.length + 1, { shouldValidate: true });
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, [open, reset, setValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMeta(null);
    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    setUploadStatus("fetching-url");
    let meta: UploadMeta;
    try {
      const res = await categoryService.getUploadUrl(file.type);
      const uploadData = (res?.data as any)?.data || res?.data;
      if (!uploadData?.categoryId || !uploadData?.presignedUrl || !uploadData?.s3Key) {
        throw new Error("Incomplete upload URL response");
      }
      meta = {
        categoryId: uploadData.categoryId,
        presignedUrl: uploadData.presignedUrl,
        s3Key: uploadData.s3Key,
      };
      setUploadMeta(meta);
    } catch (err: any) {
      setUploadStatus("error");
      setUploadError(err?.message || "Could not get upload URL. Please try again.");
      return;
    }

    setUploadStatus("uploading");
    try {
      const uploadRes = await fetch(meta.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image to S3");
      }
      
      setUploadStatus("done");
    } catch (err: any) {
      console.error("S3 upload error:", err);
      setUploadStatus("error");
      setUploadError("Image upload failed. Please try again.");
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadMeta(null);
    setUploadStatus("idle");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: CategoryFormValues) => {
    if (selectedFile && (!uploadMeta || uploadStatus !== "done")) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    try {
      const payload = {
        id: uploadMeta?.categoryId || crypto.randomUUID(),
        name: values.name.trim(),
        slug: values.slug,
        parentId: values.parentId ?? null,
        imageUrl: uploadMeta?.s3Key || null,
        sortOrder: Math.round(values.sortOrder),
        complianceRegime: values.complianceRegime,
        tags: values.tags || [],
      };

      const res = await categoryService.createCategory(payload);
      const success = res?.ok ?? (res?.data !== undefined);
      if (!success) {
        const msg = (res as any)?.message || "Failed to create category";
        throw new Error(msg);
      }

      toast.success(`Category "${values.name}" created successfully.`);
      onCreated();
      onOpenChange(false);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to create category";
      toast.error(errMsg);
    }
  };

  const renderUploadStatus = () => {
    if (uploadStatus === "fetching-url") return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin text-[#2d7a4f]" /> Preparing upload…
      </p>
    );
    if (uploadStatus === "uploading") return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin text-[#2d7a4f]" /> Uploading image…
      </p>
    );
    if (uploadStatus === "done") return (
      <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
        <CheckCircle2 className="h-3.5 w-3.5" /> Image uploaded successfully
      </p>
    );
    if (uploadStatus === "error") return (
      <p className="flex items-center gap-1.5 text-xs text-destructive font-medium">
        <AlertCircle className="h-3.5 w-3.5" /> {uploadError}
      </p>
    );
    return null;
  };

  const isUploadInProgress = uploadStatus === "fetching-url" || uploadStatus === "uploading";
  const canSubmit = !isSubmitting && !isUploadInProgress && (uploadStatus === "done" || !selectedFile);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar border border-border bg-background shadow-2xl rounded-xl p-6">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">Add Category</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the details to create a new product category. Image is optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Category Image</span>
              <span className="text-[10px] font-normal normal-case text-muted-foreground/60">optional</span>
            </label>
            <div
              onClick={() => !isUploadInProgress && fileInputRef.current?.click()}
              className={`
                relative flex flex-col items-center justify-center gap-3 rounded-xl border-2
                border-dashed transition-all duration-200
                ${isUploadInProgress
                  ? "cursor-not-allowed opacity-70 bg-muted/20"
                  : "cursor-pointer hover:border-[#2d7a4f] hover:bg-[#2d7a4f]/5"
                }
                ${uploadStatus === "error"
                  ? "border-destructive/40 bg-destructive/5"
                  : uploadStatus === "done"
                  ? "border-emerald-400/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-border bg-muted/10"
                }
                ${previewUrl ? "h-36" : "h-28"}
              `}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Category preview"
                    className="h-full w-full object-contain rounded-lg p-2"
                  />
                  {!isUploadInProgress && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 rounded-full bg-background border border-border p-1 shadow-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="rounded-full bg-background border border-border p-2.5 shadow-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">Click to upload image</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">PNG, JPG, WEBP supported</p>
                  </div>
                </>
              )}
            </div>
            {renderUploadStatus()}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploadInProgress}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cat-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Name <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="cat-name"
              placeholder="e.g. Farsan"
              className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                errors.name ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
              }`}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cat-slug" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Slug
            </label>
            <Input
              id="cat-slug"
              placeholder="farsan"
              className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                errors.slug ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
              }`}
              {...register("slug")}
            />
            <p className="text-[11px] text-muted-foreground/80 leading-normal">Auto-generated from name. Edit if needed.</p>
            {errors.slug && (
              <p className="text-xs font-medium text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Parent Category</span>
              <span className="text-[10px] font-normal normal-case text-muted-foreground/60">optional</span>
            </label>
            <Select
              onValueChange={(val) =>
                setValue("parentId", val === "__none__" ? null : val, { shouldValidate: true })
              }
              disabled={categoriesLoading}
            >
              <SelectTrigger className="h-10 rounded-lg border border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] transition-all text-left">
                {categoriesLoading ? (
                  <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2d7a4f]" /> Loading…
                  </span>
                ) : (
                  <SelectValue placeholder="None (top-level category)" />
                )}
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[200px] w-[var(--radix-select-trigger-width)] rounded-lg border border-border shadow-lg bg-popover text-popover-foreground">
                <SelectItem value="__none__" className="text-sm cursor-pointer py-2 focus:bg-[#2d7a4f]/5 focus:text-[#2d7a4f]">None (top-level)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-sm cursor-pointer py-2 focus:bg-[#2d7a4f]/5 focus:text-[#2d7a4f]">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground/80 leading-normal">
              Select a parent to nest this as a subcategory. Only top-level categories are listed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sort-order" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Sort Order
              </label>
              <Input
                id="sort-order"
                type="number"
                min={1}
                placeholder="1"
                className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                  errors.sortOrder ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
                }`}
                {...register("sortOrder", { valueAsNumber: true })}
              />
              {errors.sortOrder && (
                <p className="text-xs font-medium text-destructive">{errors.sortOrder.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Compliance
              </label>
              <Select
                defaultValue="fssai_basic"
                onValueChange={(val) => setValue("complianceRegime", val, { shouldValidate: true })}
              >
                <SelectTrigger className={`h-10 rounded-lg border border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] transition-all ${
                  errors.complianceRegime ? "border-destructive" : ""
                }`}>
                  <SelectValue placeholder="Select compliance" />
                </SelectTrigger>
                <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)] rounded-lg border border-border shadow-lg bg-popover text-popover-foreground">
                  <SelectItem value="fssai_basic" className="text-sm cursor-pointer py-2 focus:bg-[#2d7a4f]/5 focus:text-[#2d7a4f]">FSSAI Basic</SelectItem>
                  <SelectItem value="fssai_state" className="text-sm cursor-pointer py-2 focus:bg-[#2d7a4f]/5 focus:text-[#2d7a4f]">FSSAI State</SelectItem>
                  <SelectItem value="cosmetics_act" className="text-sm cursor-pointer py-2 focus:bg-[#2d7a4f]/5 focus:text-[#2d7a4f]">Cosmetics Act</SelectItem>
                </SelectContent>
              </Select>
              {errors.complianceRegime && (
                <p className="text-xs font-medium text-destructive">{errors.complianceRegime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Tags</span>
              <span className="text-[10px] font-normal normal-case text-muted-foreground/60">optional</span>
            </label>
            <TagInput
              id="cat-tags"
              value={tagsValue}
              onChange={(tags) => setValue("tags", tags, { shouldValidate: true })}
              placeholder="Type tag and press Enter or ,"
            />
            <p className="text-[11px] text-muted-foreground/80 leading-normal">
              Press Enter or Comma to add a tag. Backspace removes the last one.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploadInProgress}
              className="h-10 rounded-lg border border-border hover:bg-muted text-foreground transition-all duration-200 font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className="h-10 rounded-lg bg-[#2d7a4f] hover:bg-[#236040] text-white font-medium shadow-sm transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
