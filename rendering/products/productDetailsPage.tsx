"use client";

import { getS3ImageUrl } from "@/lib/s3-utils";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { StatusBadge } from "@/components/pageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function MultiSelectBadgeDropdown({
  selectedItems,      
  onRemove,           
  onAdd,              
  options,            
  searchText,         
  setSearchText,      
  dropdownOpen,       
  setDropdownOpen,    
  placeholder,        
  dropdownRef,        
  searchRef           
}: any) {
  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => { setDropdownOpen(true); searchRef.current?.focus(); }} 
        className="w-full flex items-center flex-nowrap overflow-hidden gap-1.5 px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs cursor-text hover:border-[#2d7a4f]/50 transition-all min-h-[36px]"
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground ml-0.5 shrink-0" />
        {(() => {
          let charCount = 0;
          let visibleCount = 0;
          for (const item of selectedItems) {
            charCount += item.name.length + 6; 
            if (charCount > 75 && visibleCount > 0) break;
            visibleCount++;
          }
          const visible = selectedItems.slice(0, visibleCount);
          const hidden = selectedItems.slice(visibleCount);
          
          return (
            <>
              {visible.map((item: any) => (
                <span key={item.id} className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-background text-foreground/80 border border-border/60" onClick={e => e.stopPropagation()}>
                  {item.name}
                  <button type="button" onClick={() => onRemove(item.id)} className="ml-0.5 rounded-full hover:bg-muted p-0.5 text-muted-foreground transition-colors"><X className="h-3 w-3" /></button>
                </span>
              ))}

              {hidden.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" onClick={e => e.stopPropagation()} className="shrink-0 inline-flex items-center text-xs font-semibold px-1.5 py-1 rounded bg-muted text-muted-foreground border border-border/60 hover:bg-muted/80 transition-colors">
                      +{hidden.length}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {hidden.map((item: any) => (
                        <span key={item.id} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-background text-foreground/80 border border-border/60" onClick={e => e.stopPropagation()}>
                          {item.name}
                          <button type="button" onClick={() => onRemove(item.id)} className="ml-0.5 rounded-full hover:bg-muted p-0.5 text-muted-foreground transition-colors"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              <input 
                ref={searchRef} 
                value={searchText} 
                onChange={e => { setSearchText(e.target.value); setDropdownOpen(true); }} 
                onFocus={() => setDropdownOpen(true)}
                placeholder={selectedItems.length === 0 ? placeholder : ""} 
                className="flex-1 min-w-[50px] bg-transparent text-xs outline-none placeholder:text-muted-foreground/60 text-foreground" 
              />
            </>
          );
        })()}
      </div>
      {dropdownOpen && options.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/60 bg-card shadow-xl max-h-44 overflow-y-auto">
            {options.map((opt: any) => (
              <button key={opt.id} type="button" onClick={() => { onAdd(opt); setDropdownOpen(false); setSearchText(""); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-muted/40 transition-colors">
                <span className="flex-1 font-medium">{opt.name}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (val: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-[#2d7a4f]" : "bg-muted-foreground/30"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
import { cuisineService } from "@/services/cuisine.service";
import { dietaryTypeService } from "@/services/dietary-type.service";
import { keywordService, type Keyword } from "@/services/keyword.service";
import { nutritionService, type Nutrition } from "@/services/nutrition.service";
import { ingredientService, type Ingredient } from "@/services/ingredient.service";
import { tagService, type Tag as TagType } from "@/services/tag.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  Loader2, ArrowLeft, Store, IndianRupee, Timer, Scale, Clock, ShieldAlert,
  ShoppingBag, Trash2, Tag, Upload, X, AlertCircle, Save, ChevronLeft, ChevronRight,
  Search, Plus, Key, Star, Video, Layers, CheckCircle2, Copy, Percent, Sparkles,
  UserCheck, MapPin, Flame, ShieldCheck, ExternalLink, RotateCcw, Maximize2, Edit3
} from "lucide-react";
import toast from "react-hot-toast";

type Props = { productId: string };

const normalizeStringArray = (arr: any[] | undefined | null): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return item;
    return item?.name || item?.tag || String(item);
  }).filter(Boolean);
};

const resolveImageUrl = (imgObj: any): string | null => {
  if (!imgObj) return null;
  if (imgObj.cdnUrl) return imgObj.cdnUrl;
  if (imgObj.url) return getS3ImageUrl(imgObj.url);
  if (imgObj.b2Path) return getS3ImageUrl(imgObj.b2Path);
  return null;
};

function CardHeader({
  title,
  icon: Icon,
  isDirty,
  isSubmitting,
  onSave
}: {
  title: string;
  icon?: React.ElementType;
  isDirty?: boolean;
  isSubmitting?: boolean;
  onSave?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/10">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-[#2d7a4f]" />}
        <h3 className="text-xs font-bold text-foreground/90 uppercase tracking-wider">{title}</h3>
      </div>
      {onSave && (
        <Button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSubmitting}
          size="sm"
          className={`h-7 px-3 text-xs gap-1.5 transition-all ${
            isDirty ? "bg-[#2d7a4f] hover:bg-[#236040] text-white shadow-sm" : "bg-muted text-muted-foreground"
          }`}
        >
          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save
        </Button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. BASIC INFO & MEDIA SECTION
// ----------------------------------------------------------------------
const basicInfoSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional().nullable(),
  cookingVideoUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});
type BasicInfoValues = z.infer<typeof basicInfoSchema>;

function BasicInfoSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const { register, handleSubmit, setValue, watch, formState: { isDirty, isSubmitting, errors }, reset } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: product.name || "",
      description: product.description || "",
      cookingVideoUrl: product.cookingVideoUrl || "",
    }
  });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const cookingVideoUrl = watch("cookingVideoUrl");

  useEffect(() => {
    reset({
      name: product.name || "",
      description: product.description || "",
      cookingVideoUrl: product.cookingVideoUrl || "",
    });
  }, [product, reset]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    const toastId = toast.loading("Uploading cooking video...");
    try {
      const res = await productService.getProductUploadUrl(file.type, product.id);
      const uploadData = (res?.data as any)?.data || res?.data;
      if (!uploadData?.presignedUrl || !uploadData?.s3Key) throw new Error("Incomplete upload URL response");

      const uploadRes = await fetch(uploadData.presignedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error("Failed to upload video to S3");

      const videoUrl = uploadData.presignedUrl.split("?")[0]; 
      
      setValue("cookingVideoUrl", videoUrl, { shouldValidate: true, shouldDirty: true });
      toast.success("Video uploaded successfully", { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload video", { id: toastId });
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: BasicInfoValues) => {
    try {
      await productService.updateProduct(product.id, {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        cookingVideoUrl: values.cookingVideoUrl?.trim() || null,
      });
      toast.success("Basic information saved");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update basic info");
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Basic Details & Media" icon={ShoppingBag} isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSubmit(onSubmit)} />
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Product Name <span className="text-destructive">*</span></span>
            <span className="text-[10px] text-muted-foreground/60 font-normal">Displayed to users</span>
          </label>
          <Input {...register("name")} placeholder="e.g. Authentic Surti Mawa Ghari" className={`h-9 font-medium text-sm ${errors.name ? "border-destructive" : ""}`} />
          {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Description</label>
          <Textarea {...register("description")} placeholder="Describe ingredients, taste profile, preparation style..." rows={3} className="resize-none text-xs leading-relaxed" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-rose-500" />
            <span>Cooking Video</span>
          </label>
          <div className="relative group rounded-xl border border-border/60 bg-muted/10 overflow-hidden aspect-video flex items-center justify-center max-h-[300px]">
            {cookingVideoUrl ? (
              <>
                <video src={cookingVideoUrl} className="w-full h-full object-cover" controls playsInline />
                <div className="absolute top-2 right-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg p-1 z-10 backdrop-blur-sm">
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition" title="Change Video">
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => setValue("cookingVideoUrl", "", { shouldDirty: true })} className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md text-white transition" title="Remove Video">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors w-full h-full">
                {uploadingVideo ? (
                   <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                ) : (
                   <>
                     <Video className="h-8 w-8" />
                     <span className="text-xs font-medium">Upload Video</span>
                   </>
                )}
              </button>
            )}
            <input type="file" accept="video/*" ref={videoInputRef} className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
          </div>
          {errors.cookingVideoUrl && <p className="text-[10px] text-destructive">{errors.cookingVideoUrl.message}</p>}
        </div>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. PRICING, TAX & DIMENSIONS SECTION
// ----------------------------------------------------------------------
const pricingSchema = z.object({
  basePricePaisa: z.number().min(1, "Base price is required"),
  actualPricePaisa: z.number().optional().nullable(),
  gstRateBps: z.number().min(0, "GST must be >= 0").optional().nullable(),
  preparationTimeMinutes: z.number().int().min(1, "Must be at least 1 minute"),
  shelfLifeHours: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  weightUnit: z.string().optional().nullable(),
});
type PricingValues = z.infer<typeof pricingSchema>;

function PricingSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const { register, handleSubmit, formState: { isDirty, isSubmitting, errors }, reset } = useForm<PricingValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      basePricePaisa: product.basePricePaisa ? product.basePricePaisa / 100 : 0,
      actualPricePaisa: product.actualPricePaisa ? product.actualPricePaisa / 100 : null,
      gstRateBps: product.gstRateBps ?? 0,
      preparationTimeMinutes: product.preparationTimeMinutes || 0,
      shelfLifeHours: product.shelfLifeHours || null,
      weight: product.weight || null,
      weightUnit: product.weightUnit || "gm",
    }
  });

  useEffect(() => {
    reset({
      basePricePaisa: product.basePricePaisa ? product.basePricePaisa / 100 : 0,
      actualPricePaisa: product.actualPricePaisa ? product.actualPricePaisa / 100 : null,
      gstRateBps: product.gstRateBps ?? 0,
      preparationTimeMinutes: product.preparationTimeMinutes || 0,
      shelfLifeHours: product.shelfLifeHours || null,
      weight: product.weight || null,
      weightUnit: product.weightUnit || "gm",
    });
  }, [product, reset]);

  const onSubmit = async (values: PricingValues) => {
    try {
      await productService.updateProduct(product.id, {
        basePricePaisa: Math.round(values.basePricePaisa * 100),
        actualPricePaisa: values.actualPricePaisa ? Math.round(values.actualPricePaisa * 100) : null,
        gstRateBps: values.gstRateBps !== null && values.gstRateBps !== undefined ? Math.round(values.gstRateBps) : null,
        preparationTimeMinutes: Math.round(values.preparationTimeMinutes),
        shelfLifeHours: values.shelfLifeHours || null,
        weight: values.weight || null,
        weightUnit: values.weightUnit || null,
      });
      toast.success("Pricing & dimensions updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update pricing");
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Pricing, Tax & Dimensions" icon={IndianRupee} isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSubmit(onSubmit)} />
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 grid grid-cols-2 gap-3">
        {/* Base Selling Price */}
        <div className="space-y-1 col-span-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <IndianRupee className="h-3 w-3 text-[#2d7a4f]" /> Selling Price (₹) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            {...register("basePricePaisa", { valueAsNumber: true })}
            placeholder="0.00"
            className={`h-8 text-xs font-semibold ${errors.basePricePaisa ? "border-destructive" : ""}`}
          />
          {errors.basePricePaisa && <p className="text-[10px] text-destructive">{errors.basePricePaisa.message}</p>}
        </div>

        {/* Actual Price / MRP */}
        <div className="space-y-1 col-span-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <IndianRupee className="h-3 w-3 text-muted-foreground" /> Actual MRP (₹)
          </label>
          <Input
            type="number"
            step="0.01"
            {...register("actualPricePaisa", { valueAsNumber: true })}
            placeholder="0.00"
            className="h-8 text-xs"
          />
        </div>

        {/* GST Rate (bps) */}
        <div className="space-y-1 col-span-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Percent className="h-3 w-3 text-blue-500" /> GST Rate (bps)
          </label>
          <Input
            type="number"
            {...register("gstRateBps", { valueAsNumber: true })}
            placeholder="500 (= 5%)"
            className="h-8 text-xs"
          />
          <p className="text-[9px] text-muted-foreground/70">500 bps = 5% GST</p>
        </div>

        {/* Preparation Time */}
        <div className="space-y-1 col-span-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Timer className="h-3 w-3 text-amber-500" /> Prep Time (min) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            {...register("preparationTimeMinutes", { valueAsNumber: true })}
            className={`h-8 text-xs ${errors.preparationTimeMinutes ? "border-destructive" : ""}`}
          />
          {errors.preparationTimeMinutes && <p className="text-[10px] text-destructive">{errors.preparationTimeMinutes.message}</p>}
        </div>

        {/* Shelf Life */}
        <div className="space-y-1 col-span-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Clock className="h-3 w-3 text-sky-500" /> Shelf Life (hrs)
          </label>
          <Input
            type="number"
            {...register("shelfLifeHours", { valueAsNumber: true })}
            placeholder="48"
            className="h-8 text-xs"
          />
        </div>

        {/* Weight & Unit */}
        <div className="space-y-1 col-span-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Scale className="h-3 w-3 text-purple-500" /> Weight & Unit
          </label>
          <div className="flex gap-1.5">
            <Input
              type="number"
              step="any"
              {...register("weight", { valueAsNumber: true })}
              placeholder="500"
              className="h-8 text-xs flex-1"
            />
            <Input
              {...register("weightUnit")}
              placeholder="gm"
              className="h-8 text-xs w-16 text-center uppercase"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. IMAGES SECTION
// ----------------------------------------------------------------------
function ImagesSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const images = product.images || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading("Uploading image...");
    try {
      const res = await productService.getProductUploadUrl(file.type, product.id);
      const uploadData = (res?.data as any)?.data || res?.data;
      if (!uploadData?.presignedUrl || !uploadData?.s3Key) throw new Error("Incomplete upload URL response");

      const uploadRes = await fetch(uploadData.presignedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error("Failed to upload image binary to S3");

      await productService.addProductImage(product.id, {
        source: "admin_uploaded",
        b2Path: uploadData.s3Key,
        isLabelRequired: false,
        sortOrder: images.length,
      });

      toast.success("Image uploaded successfully", { id: toastId });
      onUpdate();
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this product image?")) return;
    try {
      await productService.deleteProductImage(imageId);
      toast.success("Image deleted");
      if (previewIndex !== null) setPreviewIndex(null);
      onUpdate();
    } catch (err: any) {
      toast.error("Failed to delete image");
    }
  };

  const currentPreviewSrc = previewIndex !== null && images[previewIndex] ? resolveImageUrl(images[previewIndex]) : null;

  return (
    <>
      <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <CardHeader title={`Product Gallery (${images.length})`} icon={Upload} />
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img: any, index: number) => {
              const src = resolveImageUrl(img);
              return (
                <div
                  key={img.id}
                  onClick={() => setPreviewIndex(index)}
                  className="relative group aspect-square rounded-xl border border-border/60 overflow-hidden bg-muted/20 shadow-sm cursor-pointer hover:border-[#2d7a4f] transition-all"
                  title="Click to view image preview"
                >
                  {src ? (
                    <img src={src} alt={`Product photo ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-6 w-6 opacity-40" />
                    </div>
                  )}

                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#2d7a4f] text-white shadow-sm z-10 pointer-events-none">
                      Primary
                    </span>
                  )}

                  {/* Delete button overlay on top-right */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 rounded-md shadow-md"
                      onClick={(e) => handleDeleteImage(e, img.id)}
                      title="Delete Image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <div
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all
                ${uploadingImage ? "opacity-50 cursor-not-allowed bg-muted/20 border-border" : "cursor-pointer border-border/80 hover:border-[#2d7a4f] hover:bg-[#2d7a4f]/5"}
              `}
            >
              {uploadingImage ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#2d7a4f]" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground/70" />
                  <span className="text-[10px] font-bold text-muted-foreground">Add Photo</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && setPreviewIndex(null)}>
        <DialogContent className="max-w-3xl p-4 bg-background overflow-hidden border border-border/80 rounded-2xl">
          <DialogHeader className="pb-2 border-b border-border/60">
            <DialogTitle className="text-sm font-bold flex items-center justify-between">
              <span>Product Image Preview {previewIndex !== null ? `(${previewIndex + 1} of ${images.length})` : ""}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex items-center justify-center min-h-[300px] max-h-[70vh] bg-black/95 rounded-xl overflow-hidden p-2">
            {currentPreviewSrc ? (
              <img src={currentPreviewSrc} alt="Preview" className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg" />
            ) : (
              <div className="text-muted-foreground text-xs">No image source</div>
            )}

            {/* Navigation arrows inside preview modal */}
            {images.length > 1 && previewIndex !== null && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white text-black shadow-lg"
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white text-black shadow-lg"
                  disabled={previewIndex === images.length - 1}
                  onClick={() => setPreviewIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------
// 4. CHEF & KITCHEN INFO CARD
// ----------------------------------------------------------------------
function ChefInfoSection({ chef }: { chef: any }) {
  if (!chef) return null;
  const cp = chef.chefProfile || {};
  const city = cp.city?.name || "N/A";

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Chef & Home Kitchen Info" icon={Store} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              {cp.businessName || "Chef Kitchen"}
              {cp.ratingAvg && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                  {cp.ratingAvg} ({cp.ratingCount || 0})
                </span>
              )}
            </h4>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              <span>Chef: {cp.displayName || "N/A"}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-rose-500" /> {city}</span>
            </p>
          </div>
          <Badge variant={cp.isOnline ? "default" : "outline"} className={`text-[10px] ${cp.isOnline ? "bg-emerald-600" : ""}`}>
            {cp.isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {cp.bio && (
          <p className="text-xs text-muted-foreground/80 italic leading-relaxed line-clamp-2 bg-muted/15 p-2 rounded-lg border border-border/40">
            &ldquo;{cp.bio}&rdquo;
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold p-1.5 rounded-md bg-muted/20 border border-border/40">
            <ShieldCheck className={`h-3.5 w-3.5 ${cp.isKycApproved ? "text-emerald-600" : "text-muted-foreground/40"}`} />
            <span>KYC {cp.isKycApproved ? "✓" : "Pending"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold p-1.5 rounded-md bg-muted/20 border border-border/40">
            <UserCheck className={`h-3.5 w-3.5 ${cp.isAddressApproved ? "text-emerald-600" : "text-muted-foreground/40"}`} />
            <span>Address {cp.isAddressApproved ? "✓" : "Pending"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold p-1.5 rounded-md bg-muted/20 border border-border/40">
            <CheckCircle2 className={`h-3.5 w-3.5 ${cp.isBankApproved ? "text-emerald-600" : "text-muted-foreground/40"}`} />
            <span>Bank {cp.isBankApproved ? "✓" : "Pending"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold p-1.5 rounded-md bg-muted/20 border border-border/40">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Stoves: {cp.stoveCount ?? 1}</span>
          </div>
        </div>

        {chef.phone && (
          <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1.5">
            <span className="font-semibold">Phone:</span> {chef.phone}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. TAXONOMY SECTION (Cuisines, Dietary, Category)
// ----------------------------------------------------------------------
function TaxonomySection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const [allCuisines, setAllCuisines] = useState<any[]>([]);
  const [allDietaryTypes, setAllDietaryTypes] = useState<any[]>([]);

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(product.cuisines?.map((c: any) => c.cuisineId ?? c.id) || []);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(product.dietaryTypes?.map((d: any) => d.dietaryTypeId ?? d.id) || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cuisineDropdownOpen, setCuisineDropdownOpen] = useState(false);
  const [cuisineSearchText, setCuisineSearchText] = useState("");
  const cuisineDropdownRef = React.useRef<HTMLDivElement>(null);
  const cuisineSearchRef = React.useRef<HTMLInputElement>(null);

  const [dietaryDropdownOpen, setDietaryDropdownOpen] = useState(false);
  const [dietarySearchText, setDietarySearchText] = useState("");
  const dietaryDropdownRef = React.useRef<HTMLDivElement>(null);
  const dietarySearchRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cuisineDropdownRef.current && !cuisineDropdownRef.current.contains(e.target as Node)) { setCuisineDropdownOpen(false); setCuisineSearchText(""); }
      if (dietaryDropdownRef.current && !dietaryDropdownRef.current.contains(e.target as Node)) { setDietaryDropdownOpen(false); setDietarySearchText(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  useEffect(() => {
    cuisineService.getCuisines({ limit: 100 }).then(res => setAllCuisines((res.data as any)?.items || res.data || []));
    dietaryTypeService.getDietaryTypes({ limit: 100 }).then(res => setAllDietaryTypes((res.data as any)?.items || res.data || []));
  }, []);

  useEffect(() => {
    setSelectedCuisines(product.cuisines?.map((c: any) => c.cuisineId ?? c.id) || []);
    setSelectedDietary(product.dietaryTypes?.map((d: any) => d.dietaryTypeId ?? d.id) || []);
  }, [product]);

  const isDirty =
    JSON.stringify(selectedCuisines) !== JSON.stringify(product.cuisines?.map((c: any) => c.cuisineId ?? c.id) || []) ||
    JSON.stringify(selectedDietary) !== JSON.stringify(product.dietaryTypes?.map((d: any) => d.dietaryTypeId ?? d.id) || []);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await productService.updateProduct(product.id, {
        cuisineIds: selectedCuisines,
        dietaryTypeIds: selectedDietary,
      });
      toast.success("Taxonomy saved");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update taxonomy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleList = (list: string[], setList: (l: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const category = product.category;

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col">
      <CardHeader title="Taxonomy" icon={Layers} isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSave} />
      <div className="p-4 space-y-4">
        {category && (
          <div className="p-3 rounded-lg border border-border/50 bg-muted/15 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Category & Compliance</span>
              <div className="text-xs font-bold flex items-center gap-1.5">
                {category.parent?.name && (
                  <span className="text-muted-foreground">{category.parent.name} &gt; </span>
                )}
                <span className="text-[#2d7a4f]">{category.name}</span>
              </div>
            </div>
            {category.complianceRegime && (
              <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-500/5 text-emerald-700 border-emerald-500/20">
                {category.complianceRegime.toUpperCase()}
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Cuisines</label>
          <MultiSelectBadgeDropdown
            selectedItems={allCuisines.filter((c: any) => selectedCuisines.includes(c.id))}
            onRemove={(id: string) => setSelectedCuisines(prev => prev.filter(x => x !== id))}
            onAdd={(opt: any) => setSelectedCuisines(prev => [...prev, opt.id])}
            options={allCuisines.filter((c: any) => !selectedCuisines.includes(c.id) && c.name.toLowerCase().includes(cuisineSearchText.toLowerCase()))}
            searchText={cuisineSearchText}
            setSearchText={setCuisineSearchText}
            dropdownOpen={cuisineDropdownOpen}
            setDropdownOpen={setCuisineDropdownOpen}
            placeholder="Search cuisines..."
            dropdownRef={cuisineDropdownRef}
            searchRef={cuisineSearchRef}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Dietary Types</label>
          <MultiSelectBadgeDropdown
            selectedItems={allDietaryTypes.filter((c: any) => selectedDietary.includes(c.id))}
            onRemove={(id: string) => setSelectedDietary(prev => prev.filter(x => x !== id))}
            onAdd={(opt: any) => setSelectedDietary(prev => [...prev, opt.id])}
            options={allDietaryTypes.filter((c: any) => !selectedDietary.includes(c.id) && c.name.toLowerCase().includes(dietarySearchText.toLowerCase()))}
            searchText={dietarySearchText}
            setSearchText={setDietarySearchText}
            dropdownOpen={dietaryDropdownOpen}
            setDropdownOpen={setDietaryDropdownOpen}
            placeholder="Search dietary types..."
            dropdownRef={dietaryDropdownRef}
            searchRef={dietarySearchRef}
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. ATTRIBUTES SECTION (Ingredients, Allergens, Tags, Keywords)
// ----------------------------------------------------------------------
function AttributesSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cuisineDropdownOpen, setCuisineDropdownOpen] = useState(false);
  const [cuisineSearchText, setCuisineSearchText] = useState("");
  const cuisineDropdownRef = React.useRef<HTMLDivElement>(null);
  const cuisineSearchRef = React.useRef<HTMLInputElement>(null);

  const [dietaryDropdownOpen, setDietaryDropdownOpen] = useState(false);
  const [dietarySearchText, setDietarySearchText] = useState("");
  const dietaryDropdownRef = React.useRef<HTMLDivElement>(null);
  const dietarySearchRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cuisineDropdownRef.current && !cuisineDropdownRef.current.contains(e.target as Node)) { setCuisineDropdownOpen(false); setCuisineSearchText(""); }
      if (dietaryDropdownRef.current && !dietaryDropdownRef.current.contains(e.target as Node)) { setDietaryDropdownOpen(false); setDietarySearchText(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  // --- Nutritions ---
  const [selectedNutritions, setSelectedNutritions] = useState<{ nutritionId: string; name: string; slug: string; value: number | string; unit: string; icon?: string | null }[]>([]);
  const [nutriDropdownOpen, setNutriDropdownOpen] = useState(false);
  const [nutriSearchText, setNutriSearchText] = useState("");
  const [allNutritions, setAllNutritions] = useState<Nutrition[]>([]);
  const [loadingNutritions, setLoadingNutritions] = useState(false);
  const nutriDropdownRef = React.useRef<HTMLDivElement>(null);
  const nutriSearchRef = React.useRef<HTMLInputElement>(null);

  // --- Ingredients ---
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [ingDropdownOpen, setIngDropdownOpen] = useState(false);
  const [ingSearchText, setIngSearchText] = useState("");
  const ingDropdownRef = React.useRef<HTMLDivElement>(null);
  const ingSearchRef = React.useRef<HTMLInputElement>(null);

  // --- Allergens ---
  const [allergens, setAllergens] = useState<string[]>([]);

  // --- Tags ---
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [tagsSearchText, setTagsSearchText] = useState("");
  const tagsDropdownRef = React.useRef<HTMLDivElement>(null);
  const tagsSearchRef = React.useRef<HTMLInputElement>(null);

  // --- Keywords ---
  const [selectedKeywords, setSelectedKeywords] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
  const [kwDropdownOpen, setKwDropdownOpen] = useState(false);
  const [kwSearchText, setKwSearchText] = useState("");
  const [creatingKw, setCreatingKw] = useState(false);
  const kwDropdownRef = React.useRef<HTMLDivElement>(null);
  const kwSearchRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync from product
    const rawIngs = product.ingredientsList || product.ingredients || [];
    setSelectedIngredients(rawIngs.map((i: any) => typeof i === "string" ? { id: i, name: i } : i));
    setAllergens(normalizeStringArray(product.allergens));
    const tagsArr = Array.isArray(product.tags) ? product.tags : [];
    setSelectedTags(tagsArr.map((t: any) => typeof t === "string" ? { id: t, name: t } : t));
    setSelectedKeywords(product.keywords || []);
    setSelectedNutritions(product.nutritions || []);
  }, [product]);

  // Fetches
  useEffect(() => {
    if (ingDropdownOpen) {
      const timer = setTimeout(() => { ingredientService.getIngredients({ search: ingSearchText || undefined, limit: 50 }).then(res => setAllIngredients(res?.data?.items || [])) }, 300);
      return () => clearTimeout(timer);
    }
  }, [ingDropdownOpen, ingSearchText]);

  useEffect(() => {
    if (tagsDropdownOpen) {
      const timer = setTimeout(() => { tagService.getTags({ search: tagsSearchText || undefined, limit: 50 }).then(res => setAllTags(res?.data?.items || [])) }, 300);
      return () => clearTimeout(timer);
    }
  }, [tagsDropdownOpen, tagsSearchText]);

  useEffect(() => {
    if (kwDropdownOpen) {
      const timer = setTimeout(() => { keywordService.getKeywords({ search: kwSearchText || undefined, limit: 50 }).then(res => setAllKeywords(res?.data?.items || [])) }, 300);
      return () => clearTimeout(timer);
    }
  }, [kwDropdownOpen, kwSearchText]);

  useEffect(() => {
    if (!nutriDropdownOpen) return;
    setLoadingNutritions(true);
    const timer = setTimeout(async () => {
      try {
        const res = await nutritionService.getNutritions({ search: nutriSearchText || undefined, limit: 50, isActive: true, status: "approved" });
        setAllNutritions(res?.data?.items || []);
      } catch {
        setAllNutritions([]);
      } finally {
        setLoadingNutritions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [nutriDropdownOpen, nutriSearchText]);

  // Click outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ingDropdownRef.current && !ingDropdownRef.current.contains(e.target as Node)) { setIngDropdownOpen(false); setIngSearchText(""); }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(e.target as Node)) { setTagsDropdownOpen(false); setTagsSearchText(""); }
      if (kwDropdownRef.current && !kwDropdownRef.current.contains(e.target as Node)) { setKwDropdownOpen(false); setKwSearchText("");       if (nutriDropdownRef.current && !nutriDropdownRef.current.contains(e.target as Node)) { setNutriDropdownOpen(false); setNutriSearchText(""); }
}
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (nutriDropdownOpen) setTimeout(() => nutriSearchRef.current?.focus(), 50);
  }, [nutriDropdownOpen]);

  const selectedNutriIds = new Set(selectedNutritions.map((n) => n.nutritionId));
  const filteredNutritions = allNutritions.filter(
    (n) => !selectedNutriIds.has(n.id) &&
      (nutriSearchText === "" || n.name.toLowerCase().includes(nutriSearchText.toLowerCase()))
  );

  const handleSelectNutri = (nt: Nutrition) => {
    if (!selectedNutriIds.has(nt.id)) {
      setSelectedNutritions((prev) => [...prev, { nutritionId: nt.id, name: nt.name, slug: nt.slug, value: "", unit: nt.defaultUnit || "g", icon: nt.icon }]);
    }
    setNutriSearchText("");
    setNutriDropdownOpen(false);
  };

  const handleRemoveNutri = (id: string) => setSelectedNutritions((prev) => prev.filter((n) => n.nutritionId !== id));
  const handleChangeNutri = (id: string, field: "value" | "unit", val: string) => {
    setSelectedNutritions((prev) => prev.map((n) => (n.nutritionId === id ? { ...n, [field]: val } : n)));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const isDirtyIngsAllergens = JSON.stringify(selectedIngredients.map(i => i.id)) !== JSON.stringify((product.ingredientsList || product.ingredients || []).map((i: any) => i.id || i)) || JSON.stringify(allergens) !== JSON.stringify(normalizeStringArray(product.allergens));
      const isDirtyTags = JSON.stringify(selectedTags.map(t => t.id)) !== JSON.stringify((product.tags || []).map((t: any) => t.id || t));
      const isDirtyKeywords = selectedKeywords.map((k) => k.id).sort().join(",") !== (product.keywords || []).map((k: any) => k.id).sort().join(",");

      if (isDirtyIngsAllergens) {
        await productService.updateProduct(product.id, { ingredientsList: selectedIngredients.map(i => i.id), allergens });
      }
      if (isDirtyTags) {
        await productService.updateProductTags(product.id, selectedTags.map(t => t.id));
      }
      if (isDirtyKeywords) {
        await productService.updateProductKeywords(product.id, selectedKeywords.map(k => k.name));
      }

      const isDirtyNutritions = JSON.stringify(selectedNutritions.map(n => ({ nutritionId: n.nutritionId, value: Number(n.value), unit: n.unit }))) !== JSON.stringify((product.nutritions || []).map((n:any) => ({ nutritionId: n.nutritionId, value: Number(n.value), unit: n.unit })));
      if (isDirtyNutritions) {
        const payloadNutritions = selectedNutritions.map((n) => ({
          nutritionId: n.nutritionId,
          value: Number(n.value) || 0,
          unit: n.unit || "g"
        }));
        await productService.updateProduct(product.id, { nutritions: payloadNutritions });
      }


      toast.success("Attributes saved");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update attributes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = true; // Simplified for this unified section

  const handleCreateKw = async () => {
    const name = kwSearchText.trim();
    if (!name) return;
    setCreatingKw(true);
    try {
      const res = await keywordService.createKeyword({ name, active: true });
      const newKw = res?.data;
      if (newKw) { setSelectedKeywords(prev => [...prev, { id: newKw.id, name: newKw.name, slug: newKw.slug }]); toast.success(`Keyword added`); }
    } catch (err: any) { toast.error("Failed to create"); }
    finally { setCreatingKw(false); setKwSearchText(""); setKwDropdownOpen(false); }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col">
      <CardHeader title="Attributes" icon={Tag} isDirty={true} isSubmitting={isSubmitting} onSave={handleSave} />
      <div className="p-4 space-y-5">

        {/* 1. Ingredients */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Ingredients</label>
          <MultiSelectBadgeDropdown
            selectedItems={selectedIngredients}
            onRemove={(id: string) => setSelectedIngredients(prev => prev.filter(x => x.id !== id))}
            onAdd={(opt: any) => setSelectedIngredients(prev => [...prev, opt])}
            options={allIngredients.filter(i => !selectedIngredients.some(s => s.id === i.id))}
            searchText={ingSearchText}
            setSearchText={setIngSearchText}
            dropdownOpen={ingDropdownOpen}
            setDropdownOpen={setIngDropdownOpen}
            placeholder="Search ingredient..."
            dropdownRef={ingDropdownRef}
            searchRef={ingSearchRef}
          />
        </div>

        {/* 2. Allergens */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Allergens</label>
          <TagInput value={allergens} onChange={setAllergens} placeholder="Type allergen and press Enter..." />
        </div>

        {/* 3. Tags */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Tags & Badges</label>
          <MultiSelectBadgeDropdown
            selectedItems={selectedTags}
            onRemove={(id: string) => setSelectedTags(prev => prev.filter(x => x.id !== id))}
            onAdd={(opt: any) => setSelectedTags(prev => [...prev, opt])}
            options={allTags.filter(t => !selectedTags.some(s => s.id === t.id))}
            searchText={tagsSearchText}
            setSearchText={setTagsSearchText}
            dropdownOpen={tagsDropdownOpen}
            setDropdownOpen={setTagsDropdownOpen}
            placeholder="Search tag..."
            dropdownRef={tagsDropdownRef}
            searchRef={tagsSearchRef}
          />
        </div>

        {/* Nutritions */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Nutritional Values</label>
          <div className="space-y-2 mb-2">
            {selectedNutritions.map((nt) => (
              <div key={nt.nutritionId} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/10 relative group">
                <div className="flex items-center gap-1.5 min-w-[120px]">
                  {nt.icon && nt.icon !== "" ? (
                    <img src={nt.icon} alt={nt.name} className="w-3.5 h-3.5 object-contain" />
                  ) : (
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs font-bold text-foreground truncate">{nt.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5 flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={nt.value}
                    onChange={(e) => handleChangeNutri(nt.nutritionId, "value", e.target.value)}
                    placeholder="Value"
                    className="h-7 text-xs flex-1"
                  />
                  <Input
                    value={nt.unit}
                    onChange={(e) => handleChangeNutri(nt.nutritionId, "unit", e.target.value)}
                    placeholder="Unit"
                    className="h-7 text-xs w-16 text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveNutri(nt.nutritionId)}
                  className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  title="Remove nutrition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="relative" ref={nutriDropdownRef}>
            <button
              type="button"
              onClick={() => setNutriDropdownOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-background text-xs text-muted-foreground hover:border-[#2d7a4f]/50 hover:text-foreground transition-all text-left"
            >
              <Search className="h-3 w-3 shrink-0" />
              <span className="flex-1">Search or add nutrition...</span>
              <Plus className="h-3 w-3 shrink-0" />
            </button>

            {nutriDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    ref={nutriSearchRef}
                    value={nutriSearchText}
                    onChange={(e) => setNutriSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") { setNutriDropdownOpen(false); setNutriSearchText(""); }
                    }}
                    placeholder="Search nutrition..."
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
                  />
                  {nutriSearchText && (
                    <button onClick={() => setNutriSearchText("")} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="max-h-44 overflow-y-auto">
                  {loadingNutritions ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-[#2d7a4f]" />
                    </div>
                  ) : (
                    <>
                      {filteredNutritions.map((nt) => (
                        <button
                          key={nt.id}
                          type="button"
                          onClick={() => handleSelectNutri(nt)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-muted/40 transition-colors"
                        >
                          {nt.icon && nt.icon !== "" ? (
                            <img src={nt.icon} alt={nt.name} className="w-3.5 h-3.5 object-contain shrink-0" />
                          ) : (
                            <Scale className="h-3.5 w-3.5 text-[#2d7a4f] shrink-0" />
                          )}
                          <span className="flex-1 font-medium">{nt.name}</span>
                          <span className="text-[9px] text-muted-foreground">({nt.defaultUnit})</span>
                        </button>
                      ))}

                      {filteredNutritions.length === 0 && (
                        <p className="text-[11px] text-muted-foreground/60 text-center py-4">
                          {nutriSearchText ? "No matching nutrition found" : "All available nutritions added"}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Keywords */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Keywords</label>
          <div className="relative" ref={kwDropdownRef}>
            <div 
              onClick={() => { setKwDropdownOpen(true); kwSearchRef.current?.focus(); }} 
              className="w-full flex items-center flex-nowrap overflow-hidden gap-1.5 px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs cursor-text hover:border-[#2d7a4f]/50 transition-all min-h-[36px]"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground ml-0.5 shrink-0" />
              {(() => {
                let charCount = 0;
                let visibleCount = 0;
                for (const kw of selectedKeywords) {
                  charCount += kw.name.length + 6; 
                  if (charCount > 75 && visibleCount > 0) break;
                  visibleCount++;
                }
                const visible = selectedKeywords.slice(0, visibleCount);
                const hidden = selectedKeywords.slice(visibleCount);
                
                return (
                  <>
                    {visible.map((kw: any) => (
                      <span key={kw.id} className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-background text-foreground/80 border border-border/60" onClick={e => e.stopPropagation()}>
                        {kw.name}
                        <button type="button" onClick={() => setSelectedKeywords(prev => prev.filter(k => k.id !== kw.id))} className="ml-0.5 rounded-full hover:bg-muted p-0.5 text-muted-foreground transition-colors"><X className="h-3 w-3" /></button>
                      </span>
                    ))}

                    {hidden.length > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" onClick={e => e.stopPropagation()} className="shrink-0 inline-flex items-center text-xs font-semibold px-1.5 py-1 rounded bg-muted text-muted-foreground border border-border/60 hover:bg-muted/80 transition-colors">
                            +{hidden.length}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {hidden.map((kw: any) => (
                              <span key={kw.id} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-background text-foreground/80 border border-border/60" onClick={e => e.stopPropagation()}>
                                {kw.name}
                                <button type="button" onClick={() => setSelectedKeywords(prev => prev.filter(k => k.id !== kw.id))} className="ml-0.5 rounded-full hover:bg-muted p-0.5 text-muted-foreground transition-colors"><X className="h-3 w-3" /></button>
                              </span>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    <input 
                      ref={kwSearchRef} 
                      value={kwSearchText} 
                      onChange={e => { setKwSearchText(e.target.value); setKwDropdownOpen(true); }} 
                      onFocus={() => setKwDropdownOpen(true)}
                      onKeyDown={e => { if(e.key === 'Enter') handleCreateKw(); }}
                      placeholder={selectedKeywords.length === 0 ? "Search or create keyword..." : ""} 
                      className="flex-1 min-w-[50px] bg-transparent text-xs outline-none placeholder:text-muted-foreground/60 text-foreground" 
                    />
                  </>
                );
              })()}
            </div>
            {kwDropdownOpen && (allKeywords.filter(k => !selectedKeywords.some(s => s.id === k.id)).length > 0 || (kwSearchText.trim() && !allKeywords.some(k => k.name.toLowerCase() === kwSearchText.toLowerCase()))) && (
              <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/60 bg-card shadow-xl max-h-44 overflow-y-auto">
                  {allKeywords.filter(k => !selectedKeywords.some(s => s.id === k.id)).map(kw => (
                    <button key={kw.id} type="button" onClick={() => { setSelectedKeywords(prev => [...prev, {id: kw.id, name: kw.name, slug: kw.slug}]); setKwDropdownOpen(false); setKwSearchText(""); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-muted/40 transition-colors">
                      <span className="flex-1 font-medium">{kw.name}</span>
                    </button>
                  ))}
                  {kwSearchText.trim() && !allKeywords.some(k => k.name.toLowerCase() === kwSearchText.toLowerCase()) && (
                     <button type="button" onClick={handleCreateKw} disabled={creatingKw} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left border-t border-border/40 hover:bg-[#2d7a4f]/5 text-[#2d7a4f] font-semibold transition-colors">
                       {creatingKw ? <Loader2 className="h-3 w-3 animate-spin shrink-0" /> : <Plus className="h-3 w-3 shrink-0" />} Create new: "{kwSearchText.trim()}"
                     </button>
                  )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
// ----------------------------------------------------------------------
// MAIN PRODUCT DETAILS MODULE
// ----------------------------------------------------------------------
export function ProductDetailsModule({ productId }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await productService.getProductById(productId);
      if (res.ok) setProduct(res.data);
      else throw new Error("Failed to load product");
    } catch (err: any) {
      setError(err?.message || "Error fetching product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [productId]);

  const handleToggleAvailability = async (checked: boolean) => {
    if (!product) return;
    setTogglingAvailability(true);
    try {
      await productService.updateProduct(product.id, { isAvailable: checked });
      toast.success(checked ? "Product marked Available" : "Product marked Unavailable");
      fetchProduct();
    } catch (err: any) {
      toast.error("Failed to update availability");
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!product) return;
    setChangingStatus(true);
    try {
      await productService.updateProductStatus(product.id, { status: newStatus });
      toast.success(`Product status changed to ${newStatus}`);
      fetchProduct();
    } catch (err: any) {
      toast.error("Failed to update status");
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(product.id);
      toast.success("Product soft-deleted");
      fetchProduct();
    } catch (err: any) {
      toast.error("Failed to delete product");
    }
  };

  const handleRestore = async () => {
    try {
      await productService.restoreProduct(product.id);
      toast.success("Product restored");
      fetchProduct();
    } catch (err: any) {
      toast.error("Failed to restore product");
    }
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f]" />
    </div>
  );

  if (error || !product) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.push("/products")}><ArrowLeft className="h-4 w-4 mr-2"/> Back to Products</Button>
      <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3"><ShieldAlert className="h-6 w-6" /> {error || "Product not found"}</div>
    </div>
  );

  const primaryImage = product.images?.[0] ? resolveImageUrl(product.images[0]) : null;
  const isDeleted = !!product.deletedAt;

  // Calculate pricing savings percentage
  const sellingPrice = product.basePricePaisa ? product.basePricePaisa / 100 : 0;
  const actualMRP = product.actualPricePaisa ? product.actualPricePaisa / 100 : 0;
  const discountPct = (actualMRP > sellingPrice && actualMRP > 0)
    ? Math.round(((actualMRP - sellingPrice) / actualMRP) * 100)
    : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-muted/20 overflow-hidden">
      
      {/* ---------------------------------------------------------------------- */}
      {/* COMPACT STICKY HEADER */}
      {/* ---------------------------------------------------------------------- */}
      <div className="bg-card border-b border-border/60 px-5 py-3 flex flex-col shadow-sm z-10 shrink-0 gap-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/products")} className="-ml-2 h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
          </Button>

          {/* Header Actions Toolbar removed as requested */}
        </div>

        <div className="flex items-start gap-4">
          {/* Main image thumbnail */}
          <div className="shrink-0 h-14 w-14 sm:h-16 sm:w-16 bg-muted/30 rounded-xl border border-border/60 overflow-hidden flex items-center justify-center shadow-sm">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ShoppingBag className="h-7 w-7 text-muted-foreground/30" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h1 className="text-lg sm:text-xl font-black text-foreground truncate tracking-tight">
                {product.name}
              </h1>
              {isDeleted ? (
                <Badge variant="destructive" className="h-5 text-[10px]">Deleted</Badge>
              ) : (
                <StatusBadge value={product.status} />
              )}
            </div>

            {/* Badges metadata strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {product.slug && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(product.slug);
                    toast.success("Slug copied");
                  }}
                  className="font-mono text-[10px] bg-muted/60 hover:bg-muted px-2 py-0.5 rounded border border-border/60 text-muted-foreground flex items-center gap-1 transition-colors"
                  title="Click to copy slug"
                >
                  <span>/{product.slug}</span>
                  <Copy className="h-2.5 w-2.5 opacity-60" />
                </button>
              )}

              {product.category?.name && (
                <div className="flex items-center gap-1 text-[11px] text-foreground bg-muted/30 px-2 py-0.5 rounded border border-border/40 font-medium">
                  <Tag className="h-3 w-3 text-[#2d7a4f]" />
                  <span>{product.category.parent?.name ? `${product.category.parent.name} > ` : ""}{product.category.name}</span>
                </div>
              )}

              {product.chef?.chefProfile?.businessName && (
                <div className="flex items-center gap-1 text-[11px] text-foreground bg-muted/30 px-2 py-0.5 rounded border border-border/40 font-medium">
                  <Store className="h-3 w-3 text-amber-500" />
                  <span>{product.chef.chefProfile.businessName}</span>
                </div>
              )}

              {product.ratingAvg && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{product.ratingAvg} ({product.ratingCount || 0})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* SCROLLABLE MAIN CONTENT AREA */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 custom-scrollbar space-y-4">
        
        {/* Alert Banner if Deleted */}
        {isDeleted && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-xs font-semibold">This product is soft-deleted and hidden from customers.</p>
            </div>
            <Button size="sm" onClick={handleRestore} className="h-7 px-3 text-xs bg-destructive text-white hover:bg-destructive/90">Restore</Button>
          </div>
        )}

        {/* COMPACT METRIC SUMMARY CARDS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <div className="bg-card border border-border/60 rounded-xl p-2.5 shadow-sm space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Selling Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-foreground">₹{sellingPrice.toFixed(2)}</span>
              {actualMRP > sellingPrice && (
                <span className="text-[11px] line-through text-muted-foreground">₹{actualMRP.toFixed(2)}</span>
              )}
            </div>
            {discountPct > 0 && (
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                {discountPct}% OFF
              </span>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-2.5 shadow-sm space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">GST Rate</span>
            <div className="text-base font-black text-foreground">
              {product.gstRateBps ? `${product.gstRateBps / 100}%` : "0%"}
            </div>
            <span className="text-[9px] text-muted-foreground/70">
              {product.gstRateBps ?? 0} bps
            </span>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-2.5 shadow-sm space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Prep & Shelf</span>
            <div className="text-xs font-bold text-foreground truncate">
              {product.preparationTimeMinutes || 0}m prep
            </div>
            <span className="text-[9px] text-muted-foreground/80">
              {product.shelfLifeHours ? `${product.shelfLifeHours}h shelf life` : "N/A shelf life"}
            </span>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-2.5 shadow-sm space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Weight</span>
            <div className="text-base font-black text-foreground uppercase">
              {product.weight ? `${product.weight} ${product.weightUnit || "gm"}` : "N/A"}
            </div>
            <span className="text-[9px] text-muted-foreground/70">Per Portion/Pack</span>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-2.5 shadow-sm space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Chef Rating</span>
            <div className="text-sm font-black text-amber-600 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{product.chef?.chefProfile?.ratingAvg ?? "N/A"}</span>
            </div>
            <span className="text-[9px] text-muted-foreground/80 truncate block">
              {product.chef?.chefProfile?.businessName ?? "Chef Profile"}
            </span>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-2.5 shadow-sm space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Verifications</span>
            {(() => {
              const cp = product.chef?.chefProfile;
              const checks = [cp?.isKycApproved, cp?.isAddressApproved, cp?.isBankApproved, cp?.isDocumentsApproved];
              const approvedCount = checks.filter(Boolean).length;
              return (
                <>
                  <div className={`text-xs font-bold flex items-center gap-1 ${approvedCount === 4 ? "text-emerald-600" : "text-amber-600"}`}>
                    <ShieldCheck className="h-3.5 w-3.5" /> {approvedCount === 4 ? "All Approved" : `${approvedCount}/4 Approved`}
                  </div>
                  <span className="text-[9px] text-muted-foreground/80">
                    KYC • Bank • Address
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* TWO-COLUMN LAYOUT: COMPACT & ORGANIZED */}
        {/* ---------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT COLUMN (7 Cols): Basic, Images, Chef */}
          <div className="lg:col-span-7 space-y-4">
            <BasicInfoSection product={product} onUpdate={fetchProduct} />
            <ImagesSection product={product} onUpdate={fetchProduct} />
            <ChefInfoSection chef={product.chef} />
          </div>

          {/* RIGHT COLUMN (5 Cols): Pricing, Taxonomy, Keywords, Tags, Nutritions */}
          <div className="lg:col-span-5 space-y-4">
            <PricingSection product={product} onUpdate={fetchProduct} />
            <TaxonomySection product={product} onUpdate={fetchProduct} />
            <AttributesSection product={product} onUpdate={fetchProduct} />
            
          </div>

        </div>

      </div>
    </div>
  );
}
