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
import { Input } from "@/components/ui/input";
import { cuisineService, dietaryTypeService, foodGoalService, tastePreferenceService } from "@/services";

const entityFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  sortOrder: z.number().int("Sort order must be an integer").min(1, "Sort order must be at least 1"),
});

type EntityFormValues = z.infer<typeof entityFormSchema>;
type UploadStatus = "idle" | "fetching-url" | "uploading" | "done" | "error";
type UploadMeta = { presignedUrl: string; s3Key: string; id?: string };

export type EntityType = "cuisine" | "dietaryType" | "foodGoal" | "tastePreference";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  mode: "create" | "edit";
  initialData?: any | null;
  nextSortOrder?: number;
  onSuccess: () => void;
};

export function EntityFormModal({ open, onOpenChange, entityType, mode, initialData, nextSortOrder = 1, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMeta, setUploadMeta] = useState<UploadMeta | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntityFormValues>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sortOrder: nextSortOrder,
    },
  });

  const getEntityTitle = (type: EntityType) => {
    switch (type) {
      case "cuisine": return "Cuisine";
      case "dietaryType": return "Dietary Type";
      case "foodGoal": return "Food Goal";
      case "tastePreference": return "Taste Preference";
    }
  };

  const entityTitle = getEntityTitle(entityType);

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const region = process.env.NEXT_PUBLIC_S3_REGION || "us-east-1";
    const bucket = process.env.NEXT_PUBLIC_S3_PUBLIC_BUCKET || "lifoo-dev-public";
    const cleanPath = imagePath.replace(/^\/+/, "");
    return `https://${bucket}.s3.${region}.amazonaws.com/${cleanPath}`;
  };

  const nameValue = watch("name");

  useEffect(() => {
    if ((mode === "create" || (mode === "edit" && initialData && nameValue !== initialData.name))) {
      const slug = nameValue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValue("slug", slug, { shouldValidate: !!nameValue });
    }
  }, [nameValue, setValue, mode, initialData]);

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadMeta(null);
      setUploadStatus("idle");
      setUploadError(null);
      setImageRemoved(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        sortOrder: initialData.sortOrder ?? 1,
      });

      const existingImg = initialData.imageUrl || initialData.iconUrl || null;
      if (existingImg) {
        setPreviewUrl(getImageUrl(existingImg));
      } else {
        setPreviewUrl(null);
      }
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        sortOrder: nextSortOrder,
      });
      setPreviewUrl(null);
    }
  }, [open, mode, initialData, nextSortOrder, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMeta(null);
    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageRemoved(false);

    setUploadStatus("fetching-url");
    let meta: UploadMeta;
    try {
      let res: any;
      if (entityType === "cuisine") res = await cuisineService.getUploadUrl(file.type);
      else if (entityType === "dietaryType") res = await dietaryTypeService.getUploadUrl(file.type);
      else if (entityType === "foodGoal") res = await foodGoalService.getUploadUrl(file.type);
      else res = await tastePreferenceService.getUploadUrl(file.type);

      const uploadData = (res?.data as any)?.data || res?.data;
      if (!uploadData?.presignedUrl || !uploadData?.s3Key) {
        throw new Error("Incomplete upload URL response");
      }
      meta = {
        presignedUrl: uploadData.presignedUrl,
        s3Key: uploadData.s3Key,
        id: uploadData.id || uploadData.cuisineId || uploadData.dietaryTypeId || uploadData.foodGoalId || uploadData.tastePreferenceId,
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
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: EntityFormValues) => {
    if (selectedFile && (!uploadMeta || uploadStatus !== "done")) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    try {
      let finalImageUrl: string | null = mode === "edit" ? (initialData?.imageUrl || initialData?.iconUrl || null) : null;
      if (imageRemoved) {
        finalImageUrl = null;
      } else if (uploadMeta?.s3Key) {
        finalImageUrl = uploadMeta.s3Key;
      }

      const payload: any = {
        name: values.name.trim(),
        slug: values.slug,
        description: values.description ? values.description.trim() : null,
        sortOrder: Math.round(values.sortOrder),
      };

      if (entityType === "cuisine" || entityType === "dietaryType" || entityType === "foodGoal") {
        payload.imageUrl = finalImageUrl;
      } else {
        payload.iconUrl = finalImageUrl;
      }

      if (mode === "create") {
        if (uploadMeta?.id) {
          payload.id = uploadMeta.id;
        } else {
          payload.id = crypto.randomUUID();
        }

        let res: any;
        if (entityType === "cuisine") res = await cuisineService.createCuisine(payload);
        else if (entityType === "dietaryType") res = await dietaryTypeService.createDietaryType(payload);
        else if (entityType === "foodGoal") res = await foodGoalService.createFoodGoal(payload);
        else res = await tastePreferenceService.createTastePreference(payload);

        toast.success(`${entityTitle} "${values.name}" created successfully.`);
      } else {
        let res: any;
        if (entityType === "cuisine") res = await cuisineService.updateCuisine(initialData.id, payload);
        else if (entityType === "dietaryType") res = await dietaryTypeService.updateDietaryType(initialData.id, payload);
        else if (entityType === "foodGoal") res = await foodGoalService.updateFoodGoal(initialData.id, payload);
        else res = await tastePreferenceService.updateTastePreference(initialData.id, payload);

        toast.success(`${entityTitle} "${values.name}" updated successfully.`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || `Failed to ${mode} ${entityTitle.toLowerCase()}`;
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
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            {mode === "create" ? `Add ${entityTitle}` : `Edit ${entityTitle}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the details to {mode} this {entityTitle.toLowerCase()}. Image is optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>{entityType === "tastePreference" ? "Icon Image" : "Image"}</span>
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
                    alt="Preview"
                    className="h-full w-full object-contain rounded-lg p-2"
                  />
                  {!isUploadInProgress && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 rounded-full bg-background border border-border p-1 shadow-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
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
            <label htmlFor="entity-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Name <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="entity-name"
              placeholder={`e.g. ${entityTitle}`}
              className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${errors.name ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
                }`}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="entity-slug" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Slug <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="entity-slug"
              placeholder="slug"
              className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${errors.slug ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
                }`}
              {...register("slug")}
            />
            <p className="text-[11px] text-muted-foreground/80 leading-normal">Auto-generated from name. Edit if needed.</p>
            {errors.slug && (
              <p className="text-xs font-medium text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="entity-description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Description</span>
              <span className="text-[10px] font-normal normal-case text-muted-foreground/60">optional</span>
            </label>
            <Input
              id="entity-description"
              placeholder="Brief description..."
              className="h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="entity-sort-order" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Sort Order
            </label>
            <Input
              id="entity-sort-order"
              type="number"
              min={1}
              placeholder="1"
              className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${errors.sortOrder ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
                }`}
              {...register("sortOrder", { valueAsNumber: true })}
            />
            {errors.sortOrder && (
              <p className="text-xs font-medium text-destructive">{errors.sortOrder.message}</p>
            )}
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
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{mode === "create" ? "Creating…" : "Saving…"}</>
              ) : (
                mode === "create" ? `Create ${entityTitle}` : "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
