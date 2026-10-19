"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SplashScreen,
  splashScreenService,
  TargetPlatform,
  TargetAudience,
  CreateSplashScreenPayload,
  UpdateSplashScreenPayload,
} from "@/services/splashScreen.service";
import { getS3ImageUrl } from "@/lib/s3-utils";

const splashScreenSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Splash screen image is required"),
  displayOrder: z.number().min(1, "Display order must be at least 1"),
  isActive: z.boolean(),
  targetPlatform: z.enum(["ALL", "ANDROID", "IOS"]),
  targetAudience: z.enum(["ALL", "CUSTOMER", "CHEF"]),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type SplashScreenFormValues = z.infer<typeof splashScreenSchema>;

const toDatetimeLocal = (isoString?: string | null) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

interface AddEditSplashScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingScreen: SplashScreen | null;
  onSave: (payload: any) => Promise<void>;
  suggestedDisplayOrder?: number;
}

export function AddEditSplashScreenModal({
  open,
  onOpenChange,
  editingScreen,
  onSave,
  suggestedDisplayOrder = 1,
}: AddEditSplashScreenModalProps) {
  const mode = editingScreen ? "edit" : "create";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<SplashScreenFormValues>({
    resolver: zodResolver(splashScreenSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      displayOrder: suggestedDisplayOrder,
      isActive: true,
      targetPlatform: "ALL",
      targetAudience: "CUSTOMER",
      startsAt: "",
      expiresAt: "",
    },
  });

  const currentImageUrl = watch("imageUrl");
  const currentTargetPlatform = watch("targetPlatform");
  const currentTargetAudience = watch("targetAudience");

  // Populate/reset on dialog open
  useEffect(() => {
    if (open) {
      if (editingScreen) {
        reset({
          title: editingScreen.title || "",
          subtitle: editingScreen.subtitle || "",
          description: editingScreen.description || "",
          imageUrl: editingScreen.imageUrl || "",
          displayOrder: editingScreen.displayOrder ?? 1,
          isActive: editingScreen.isActive ?? true,
          targetPlatform: (editingScreen.targetPlatform as TargetPlatform) || "ALL",
          targetAudience: (editingScreen.targetAudience as TargetAudience) || "CUSTOMER",
          startsAt: toDatetimeLocal(editingScreen.startsAt),
          expiresAt: toDatetimeLocal(editingScreen.expiresAt),
        });
        setLocalPreviewUrl(null);
      } else {
        reset({
          title: "",
          subtitle: "",
          description: "",
          imageUrl: "",
          displayOrder: suggestedDisplayOrder,
          isActive: true,
          targetPlatform: "ALL",
          targetAudience: "CUSTOMER",
          startsAt: "",
          expiresAt: "",
        });
        setLocalPreviewUrl(null);
      }
      setIsUploadingImage(false);
      setUploadProgressText(null);
    }
  }, [open, editingScreen, suggestedDisplayOrder, reset]);

  // Handle image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPEG, WebP)");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setIsUploadingImage(true);

    try {
      setUploadProgressText("Getting upload URL…");
      const res = await splashScreenService.getUploadUrl(file.type);
      const uploadData = res?.data;

      if (!uploadData?.presignedUrl || !uploadData?.s3Key) {
        throw new Error("Invalid upload URL response from server");
      }

      setUploadProgressText("Uploading image…");
      await splashScreenService.uploadImageToS3(uploadData.presignedUrl, file);

      setValue("imageUrl", uploadData.s3Key, {
        shouldValidate: true,
        shouldDirty: true,
      });

      toast.success("Image uploaded successfully");
    } catch (err: any) {
      console.error("Image upload failed:", err);
      toast.error(err?.message || "Failed to upload image. Please try again.");
      setLocalPreviewUrl(null);
    } finally {
      setIsUploadingImage(false);
      setUploadProgressText(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true });
    setLocalPreviewUrl(null);
  };

  const onSubmit = async (values: SplashScreenFormValues) => {
    try {
      if (mode === "edit" && editingScreen) {
        const payload: UpdateSplashScreenPayload = {};

        const cleanTitle = values.title.trim();
        if (cleanTitle !== (editingScreen.title || "").trim()) {
          payload.title = cleanTitle;
        }

        const cleanSubtitle = values.subtitle?.trim() || null;
        const origSubtitle = editingScreen.subtitle?.trim() || null;
        if (cleanSubtitle !== origSubtitle) {
          payload.subtitle = cleanSubtitle;
        }

        const cleanDesc = values.description?.trim() || null;
        const origDesc = editingScreen.description?.trim() || null;
        if (cleanDesc !== origDesc) {
          payload.description = cleanDesc;
        }

        if (values.imageUrl !== editingScreen.imageUrl) {
          payload.imageUrl = values.imageUrl;
        }

        const numDisplayOrder = Number(values.displayOrder);
        if (numDisplayOrder !== Number(editingScreen.displayOrder)) {
          payload.displayOrder = numDisplayOrder;
        }

        const boolIsActive = Boolean(values.isActive);
        if (boolIsActive !== Boolean(editingScreen.isActive)) {
          payload.isActive = boolIsActive;
        }

        if (values.targetPlatform !== editingScreen.targetPlatform) {
          payload.targetPlatform = values.targetPlatform;
        }

        if (values.targetAudience !== editingScreen.targetAudience) {
          payload.targetAudience = values.targetAudience;
        }

        const newStartsAt = values.startsAt ? new Date(values.startsAt).toISOString() : null;
        const origStartsAt = editingScreen.startsAt ? new Date(editingScreen.startsAt).toISOString() : null;
        if (newStartsAt !== origStartsAt) {
          payload.startsAt = newStartsAt;
        }

        const newExpiresAt = values.expiresAt ? new Date(values.expiresAt).toISOString() : null;
        const origExpiresAt = editingScreen.expiresAt ? new Date(editingScreen.expiresAt).toISOString() : null;
        if (newExpiresAt !== origExpiresAt) {
          payload.expiresAt = newExpiresAt;
        }

        if (Object.keys(payload).length === 0) {
          toast("No changes to update", { icon: "ℹ️" });
          onOpenChange(false);
          return;
        }

        await onSave(payload);
        toast.success("Splash screen updated successfully");
      } else {
        const payload: CreateSplashScreenPayload = {
          title: values.title.trim(),
          subtitle: values.subtitle?.trim() || null,
          description: values.description?.trim() || null,
          imageUrl: values.imageUrl,
          displayOrder: Number(values.displayOrder),
          isActive: Boolean(values.isActive),
          targetPlatform: values.targetPlatform,
          targetAudience: values.targetAudience,
          startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
          expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
        };

        await onSave(payload);
        toast.success("Splash screen created successfully");
      }

      onOpenChange(false);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to save splash screen";
      toast.error(errMsg);
    }
  };

  const resolvedPreviewUrl = localPreviewUrl || getS3ImageUrl(currentImageUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[92vh] overflow-y-auto border border-border bg-background shadow-2xl rounded-xl p-5">
        <DialogHeader className="space-y-1 pb-1.5 border-b border-border/40">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            {mode === "edit" ? "Edit Splash Screen" : "New Splash Screen"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === "edit"
              ? "Update splash screen details, visual banner, or targeting rules."
              : "Register a new onboarding splash screen for customer or chef apps."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              Splash Image <span className="text-destructive font-bold">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            <div
              onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${isUploadingImage
                ? "border-emerald-500/50 bg-emerald-500/5 cursor-wait h-[118px]"
                : resolvedPreviewUrl
                  ? "border-border/70 hover:border-[#2d7a4f] bg-muted/10 h-[118px] p-1.5"
                  : "border-border/70 hover:border-[#2d7a4f] hover:bg-[#2d7a4f]/5 bg-muted/10 h-[118px]"
                }`}
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="h-6 w-6 text-[#2d7a4f] animate-spin" />
                  <p className="text-xs font-medium text-foreground">
                    {uploadProgressText || "Uploading image…"}
                  </p>
                </>
              ) : resolvedPreviewUrl ? (
                <div className="relative h-full w-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvedPreviewUrl}
                    alt="Splash screen preview"
                    className="h-full w-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-1 right-1 rounded-full bg-background/90 hover:bg-background border border-border p-1.5 shadow-md text-muted-foreground hover:text-destructive transition-colors cursor-pointer z-10"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-background border border-border p-2.5 shadow-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">Click to upload image</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      PNG, JPG, WEBP supported
                    </p>
                  </div>
                </>
              )}
            </div>

            {errors.imageUrl && (
              <p className="text-xs font-medium text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              Title <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="e.g. Authentic home cooked food"
              className={`h-9.5 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm ${errors.title ? "border-destructive focus-visible:border-destructive" : ""
                }`}
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              Subtitle
            </label>
            <Input
              {...register("subtitle")}
              placeholder="e.g. Prepared with love by verified home chefs across Gujarat"
              className="h-9.5 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              Description
            </label>
            <Textarea
              {...register("description")}
              placeholder="e.g. Watch real-time live cooking streams and order healthy ghar ka khana."
              className="min-h-[56px] rounded-lg border border-border/60 bg-background px-3 py-1.5 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm resize-none"
            />
          </div>

          {/* Target Platform & Target Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Target Platform <span className="text-destructive font-bold">*</span>
              </label>
              <Select
                value={currentTargetPlatform}
                onValueChange={(val: TargetPlatform) =>
                  setValue("targetPlatform", val, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="h-9.5 rounded-lg border-border/60 text-sm bg-background">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="ANDROID">Android</SelectItem>
                  <SelectItem value="IOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Target Audience <span className="text-destructive font-bold">*</span>
              </label>
              <Select
                value={currentTargetAudience}
                onValueChange={(val: TargetAudience) =>
                  setValue("targetAudience", val, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="h-9.5 rounded-lg border-border/60 text-sm bg-background">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="CHEF">Chef</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Display Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              Sort / Display Order <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 1"
              {...register("displayOrder", { valueAsNumber: true })}
              className="h-9.5 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm"
            />
            {errors.displayOrder && (
              <p className="text-xs font-medium text-destructive">
                {errors.displayOrder.message}
              </p>
            )}
          </div>

          {/* Optional Scheduling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Starts At
              </label>
              <Input
                type="datetime-local"
                {...register("startsAt")}
                className="h-9.5 rounded-lg border border-border/60 bg-background px-3 text-xs focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">
                Expires At
              </label>
              <Input
                type="datetime-local"
                {...register("expiresAt")}
                className="h-9.5 rounded-lg border border-border/60 bg-background px-3 text-xs focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploadingImage}
              className="h-9.5 rounded-lg border border-border hover:bg-muted text-foreground transition-all duration-200 font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="h-9.5 rounded-lg bg-[#2d7a4f] hover:bg-[#236040] text-white font-medium shadow-sm transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {mode === "create" ? "Creating…" : "Saving…"}
                </>
              ) : mode === "create" ? (
                "Create Splash Screen"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
