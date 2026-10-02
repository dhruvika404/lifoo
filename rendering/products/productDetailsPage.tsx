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
import { cuisineService } from "@/services/cuisine.service";
import { dietaryTypeService } from "@/services/dietary-type.service";
import { keywordService } from "@/services/keyword.service";
import type { Keyword } from "@/services/keyword.service";
import { nutritionService } from "@/services/nutrition.service";
import type { Nutrition } from "@/services/nutrition.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Loader2, ArrowLeft, MoreVertical, Store, IndianRupee, Timer, Scale, Clock, ShieldAlert,
  ShoppingBag, Trash2, Tag, Upload, X, AlertCircle, Save, ChevronLeft, ChevronRight, EyeOff, Check, RefreshCw,
  Search, Plus, Key
} from "lucide-react";
import toast from "react-hot-toast";

type Props = { productId: string };

const normalizeStringArray = (arr: any[] | undefined | null): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === 'string') return item;
    return item?.name || item?.tag || String(item);
  }).filter(Boolean);
};

function CardHeader({ title, isDirty, isSubmitting, onSave }: { title: string; isDirty: boolean; isSubmitting: boolean; onSave?: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 p-4 bg-muted/5">
      <h3 className="text-sm font-bold text-foreground/90 uppercase tracking-wider">{title}</h3>
      {onSave && (
        <Button 
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSubmitting}
          size="sm"
          className={`h-8 px-3 gap-1.5 transition-all ${isDirty ? "bg-[#2d7a4f] hover:bg-[#236040] text-white shadow-sm" : "bg-muted text-muted-foreground"}`}
        >
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </Button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// BASIC INFO SECTION
// ----------------------------------------------------------------------
function BasicInfoSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = name !== (product.name || "") || description !== (product.description || "");

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await productService.updateProduct(product.id, { name: name.trim(), description: description.trim() || null });
      toast.success("Basic info updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Basic Information" isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSave} />
      <div className="p-5 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Product Name <span className="text-destructive">*</span></label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spicy Mexican Tacos" className="font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={4} className="resize-none" />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// PRICING & TIMING SECTION
// ----------------------------------------------------------------------
const pricingSchema = z.object({
  basePricePaisa: z.number().min(1, "Price must be at least ₹0.01"),
  actualPricePaisa: z.number().optional().nullable(),
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
      basePricePaisa: product.basePricePaisa || 0,
      actualPricePaisa: product.actualPricePaisa || null,
      preparationTimeMinutes: product.preparationTimeMinutes || 0,
      shelfLifeHours: product.shelfLifeHours || null,
      weight: product.weight || null,
      weightUnit: product.weightUnit || "",
    }
  });

  useEffect(() => {
    reset({
      basePricePaisa: product.basePricePaisa || 0,
      actualPricePaisa: product.actualPricePaisa || null,
      preparationTimeMinutes: product.preparationTimeMinutes || 0,
      shelfLifeHours: product.shelfLifeHours || null,
      weight: product.weight || null,
      weightUnit: product.weightUnit || "",
    });
  }, [product, reset]);

  const onSubmit = async (values: PricingValues) => {
    try {
      await productService.updateProduct(product.id, {
        basePricePaisa: Math.round(values.basePricePaisa),
        actualPricePaisa: values.actualPricePaisa ? Math.round(values.actualPricePaisa) : null,
        preparationTimeMinutes: Math.round(values.preparationTimeMinutes),
        shelfLifeHours: values.shelfLifeHours || null,
        weight: values.weight || null,
        weightUnit: values.weightUnit || null,
      });
      toast.success("Pricing & timing updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update pricing");
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Pricing & Dimensions" isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSubmit(onSubmit)} />
      <div className="p-5">
        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><IndianRupee className="h-3 w-3 text-[#2d7a4f]" /> Base Price <span className="text-destructive">*</span></label>
            <Input type="number" step="0.01" {...register("basePricePaisa", { setValueAs: (v) => (v === "" ? 0 : parseFloat(v) * 100) })} defaultValue={product.basePricePaisa ? (product.basePricePaisa / 100).toFixed(2) : ""} placeholder="0.00" className={errors.basePricePaisa ? "border-destructive" : ""} />
            {errors.basePricePaisa && <p className="text-[10px] text-destructive">{errors.basePricePaisa.message}</p>}
          </div>

          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><IndianRupee className="h-3 w-3 text-muted-foreground" /> Actual Price</label>
            <Input type="number" step="0.01" {...register("actualPricePaisa", { setValueAs: (v) => (v === "" ? null : parseFloat(v) * 100) })} defaultValue={product.actualPricePaisa ? (product.actualPricePaisa / 100).toFixed(2) : ""} placeholder="0.00" className={errors.actualPricePaisa ? "border-destructive" : ""} />
            {errors.actualPricePaisa && <p className="text-[10px] text-destructive">{errors.actualPricePaisa?.message}</p>}
          </div>

          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Timer className="h-3 w-3 text-amber-500" /> Prep Time (min) <span className="text-destructive">*</span></label>
            <Input type="number" {...register("preparationTimeMinutes", { valueAsNumber: true })} className={errors.preparationTimeMinutes ? "border-destructive" : ""} />
            {errors.preparationTimeMinutes && <p className="text-[10px] text-destructive">{errors.preparationTimeMinutes.message}</p>}
          </div>

          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Clock className="h-3 w-3 text-sky-500" /> Shelf Life (hrs)</label>
            <Input type="number" {...register("shelfLifeHours", { valueAsNumber: true })} />
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Scale className="h-3 w-3 text-purple-500" /> Weight</label>
            <div className="flex gap-2">
              <Input type="number" step="any" {...register("weight", { valueAsNumber: true })} placeholder="0" className="flex-1" />
              <Input {...register("weightUnit")} placeholder="g/kg" className="w-16 text-center" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// TAGS SECTION
// ----------------------------------------------------------------------
function TagsSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const [tags, setTags] = useState<string[]>(normalizeStringArray(product.tags));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deep compare tags
  const isDirty = JSON.stringify(tags) !== JSON.stringify(normalizeStringArray(product.tags));

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await productService.updateProductTags(product.id, tags);
      toast.success("Tags updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update tags");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => { setTags(normalizeStringArray(product.tags)); }, [product.tags]);

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Tags" isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSave} />
      <div className="p-5">
        <TagInput value={tags} onChange={setTags} placeholder="Add tag and press Enter..." />
        <p className="text-[11px] text-muted-foreground/80 mt-2">
          Used for search, filtering, and curations (e.g., bestseller, chef-special).
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// KEYWORDS SECTION
// ----------------------------------------------------------------------
function KeywordsSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  // Existing keywords on the product: array of { id, name, slug }
  const [selectedKeywords, setSelectedKeywords] = useState<{ id: string; name: string; slug: string }[]>(
    product.keywords || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [creating, setCreating] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Derived dirty check — compare IDs
  const originalIds = (product.keywords || []).map((k: any) => k.id).sort().join(",");
  const currentIds = selectedKeywords.map((k) => k.id).sort().join(",");
  const isDirty = originalIds !== currentIds;

  // Sync when product prop changes
  useEffect(() => {
    setSelectedKeywords(product.keywords || []);
  }, [product.keywords]);

  // Fetch keywords from API (debounced on search)
  useEffect(() => {
    if (!dropdownOpen) return;
    setLoadingKeywords(true);
    const timer = setTimeout(async () => {
      try {
        const res = await keywordService.getKeywords({ search: searchText || undefined, limit: 50 });
        setAllKeywords(res?.data?.items || []);
      } catch {
        setAllKeywords([]);
      } finally {
        setLoadingKeywords(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dropdownOpen, searchText]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);

  const selectedIds = new Set(selectedKeywords.map((k) => k.id));

  // Keywords from API not already selected
  const filteredKeywords = allKeywords.filter(
    (k) => !selectedIds.has(k.id) &&
      (searchText === "" || k.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Check if search text matches any existing keyword name exactly (case-insensitive)
  const exactMatch = allKeywords.some(
    (k) => k.name.toLowerCase() === searchText.toLowerCase()
  ) || selectedKeywords.some(
    (k) => k.name.toLowerCase() === searchText.toLowerCase()
  );

  const canCreateNew = searchText.trim().length > 0 && !exactMatch;

  const handleSelect = (kw: Keyword) => {
    if (!selectedIds.has(kw.id)) {
      setSelectedKeywords((prev) => [...prev, { id: kw.id, name: kw.name, slug: kw.slug }]);
    }
    setSearchText("");
    setDropdownOpen(false);
  };

  const handleRemove = (id: string) => {
    setSelectedKeywords((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCreateNew = async () => {
    const name = searchText.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await keywordService.createKeyword({ name, active: true });
      const newKw = res?.data;
      if (newKw) {
        setSelectedKeywords((prev) => [...prev, { id: newKw.id, name: newKw.name, slug: newKw.slug }]);
        toast.success(`Keyword "${newKw.name}" created & added`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create keyword");
    } finally {
      setCreating(false);
      setSearchText("");
      setDropdownOpen(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const names = selectedKeywords.map((k) => k.name);
      await productService.updateProductKeywords(product.id, names);
      toast.success("Keywords updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update keywords");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Keywords" isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSave} />
      <div className="p-5 space-y-3">

        {/* Selected keyword chips */}
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {selectedKeywords.length === 0 && (
            <p className="text-[11px] text-muted-foreground/60 italic">No keywords added yet</p>
          )}
          {selectedKeywords.map((kw) => (
            <span
              key={kw.id}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#2d7a4f]/10 text-[#2d7a4f] border border-[#2d7a4f]/25"
            >
              <Key className="h-3 w-3" />
              {kw.name}
              <button
                type="button"
                onClick={() => handleRemove(kw.id)}
                className="ml-0.5 rounded-full hover:bg-[#2d7a4f]/20 p-0.5 transition-colors"
                aria-label={`Remove ${kw.name}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Searchable dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-muted-foreground hover:border-[#2d7a4f]/50 hover:text-foreground transition-all text-left"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">Search or add keyword...</span>
            <Plus className="h-3.5 w-3.5 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canCreateNew) handleCreateNew();
                    if (e.key === "Escape") { setDropdownOpen(false); setSearchText(""); }
                  }}
                  placeholder="Type to search keywords..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
                {searchText && (
                  <button onClick={() => setSearchText("")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Keyword list */}
              <div className="max-h-48 overflow-y-auto">
                {loadingKeywords ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2d7a4f]" />
                  </div>
                ) : (
                  <>
                    {filteredKeywords.map((kw) => (
                      <button
                        key={kw.id}
                        type="button"
                        onClick={() => handleSelect(kw)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-muted/40 transition-colors"
                      >
                        <Key className="h-3.5 w-3.5 text-[#2d7a4f] shrink-0" />
                        <span className="flex-1 font-medium">{kw.name}</span>
                        {!kw.active && (
                          <span className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded-full">Inactive</span>
                        )}
                      </button>
                    ))}

                    {filteredKeywords.length === 0 && !canCreateNew && (
                      <p className="text-[12px] text-muted-foreground/60 text-center py-5">
                        {searchText ? "No matching keywords found" : "All keywords already added"}
                      </p>
                    )}

                    {/* Create new option */}
                    {canCreateNew && (
                      <button
                        type="button"
                        onClick={handleCreateNew}
                        disabled={creating}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left border-t border-border/40 hover:bg-[#2d7a4f]/5 text-[#2d7a4f] font-semibold transition-colors"
                      >
                        {creating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 shrink-0" />
                        )}
                        Create new: &ldquo;{searchText.trim()}&rdquo;
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground/70">
          Search existing keywords or type a new name to create one. IDs are sent in the payload.
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SPECS SECTION
// ----------------------------------------------------------------------
function SpecsSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const [allCuisines, setAllCuisines] = useState<any[]>([]);
  const [allDietaryTypes, setAllDietaryTypes] = useState<any[]>([]);

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(product.cuisines?.map((c: any) => c.cuisineId ?? c.id) || []);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(product.dietaryTypes?.map((d: any) => d.dietaryTypeId ?? d.id) || []);
  const [ingredients, setIngredients] = useState<string[]>(normalizeStringArray(product.ingredients));
  const [allergens, setAllergens] = useState<string[]>(normalizeStringArray(product.allergens));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    cuisineService.getCuisines({ limit: 100 }).then(res => setAllCuisines((res.data as any)?.items || res.data || []));
    dietaryTypeService.getDietaryTypes({ limit: 100 }).then(res => setAllDietaryTypes((res.data as any)?.items || res.data || []));
  }, []);

  useEffect(() => {
    setSelectedCuisines(product.cuisines?.map((c: any) => c.cuisineId ?? c.id) || []);
    setSelectedDietary(product.dietaryTypes?.map((d: any) => d.dietaryTypeId ?? d.id) || []);
    setIngredients(normalizeStringArray(product.ingredients));
    setAllergens(normalizeStringArray(product.allergens));
  }, [product]);

  const isDirty = 
    JSON.stringify(selectedCuisines) !== JSON.stringify(product.cuisines?.map((c: any) => c.cuisineId ?? c.id) || []) ||
    JSON.stringify(selectedDietary) !== JSON.stringify(product.dietaryTypes?.map((d: any) => d.dietaryTypeId ?? d.id) || []) ||
    JSON.stringify(ingredients) !== JSON.stringify(normalizeStringArray(product.ingredients)) ||
    JSON.stringify(allergens) !== JSON.stringify(normalizeStringArray(product.allergens));

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await productService.updateProduct(product.id, {
        cuisineIds: selectedCuisines,
        dietaryTypeIds: selectedDietary,
        ingredients,
        allergens,
      });
      toast.success("Specifications updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update specs");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleList = (list: string[], setList: (l: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Specifications" isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSave} />
      <div className="p-5 space-y-6">
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Cuisines</label>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border/60 bg-muted/5 min-h-[48px]">
            {allCuisines.map((c: any) => {
              const selected = selectedCuisines.includes(c.id);
              return (
                <button
                  key={c.id} onClick={() => toggleList(selectedCuisines, setSelectedCuisines, c.id)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                    selected ? "bg-[#2d7a4f] text-white border-[#2d7a4f]" : "bg-background text-foreground/80 border-border/60 hover:border-[#2d7a4f]/50"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Dietary Types</label>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border/60 bg-muted/5 min-h-[48px]">
            {allDietaryTypes.map((d: any) => {
              const selected = selectedDietary.includes(d.id);
              return (
                <button
                  key={d.id} onClick={() => toggleList(selectedDietary, setSelectedDietary, d.id)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                    selected ? "bg-emerald-600 text-white border-emerald-600" : "bg-background text-foreground/80 border-border/60 hover:border-emerald-500/50"
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Ingredients</label>
          <TagInput value={ingredients} onChange={setIngredients} placeholder="Add ingredient..." />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Allergens</label>
          <TagInput value={allergens} onChange={setAllergens} placeholder="Add allergen..." />
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// IMAGES SECTION
// ----------------------------------------------------------------------
function ImagesSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      if (!uploadRes.ok) throw new Error("Failed to upload to S3");

      await productService.addProductImage(product.id, {
        source: "admin_uploaded",
        b2Path: uploadData.s3Key,
        isLabelRequired: false,
        sortOrder: product.images?.length || 0,
      });

      toast.success("Image uploaded", { id: toastId });
      onUpdate();
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      await productService.deleteProductImage(imageId);
      toast.success("Image deleted");
      onUpdate();
    } catch (err: any) {
      toast.error("Failed to delete image");
    }
  };

  const handleReorder = async (index: number, direction: 'left' | 'right') => {
    if (!product.images || product.images.length < 2) return;
    const newImages = [...product.images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    
    // Swap
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    const imageIds = newImages.map(img => img.id);
    try {
      await productService.reorderProductImages(product.id, imageIds);
      toast.success("Images reordered");
      onUpdate();
    } catch (err: any) {
      toast.error("Failed to reorder images");
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center border-b border-border/60 p-4 bg-muted/5">
        <h3 className="text-sm font-bold text-foreground/90 uppercase tracking-wider">Product Gallery</h3>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-4">
          {product.images?.map((img: any, index: number) => (
            <div key={img.id} className="relative group w-32 h-32 rounded-xl border border-border/60 overflow-hidden bg-muted/30 shadow-sm">
              <img src={getS3ImageUrl(img.url) ?? undefined} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <Button variant="destructive" size="icon" className="h-6 w-6 rounded-md shadow-sm" onClick={() => handleDeleteImage(img.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex justify-between">
                  <Button variant="secondary" size="icon" className="h-6 w-6 rounded-md shadow-sm bg-white/90 hover:bg-white text-black" disabled={index === 0} onClick={() => handleReorder(index, 'left')}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-6 w-6 rounded-md shadow-sm bg-white/90 hover:bg-white text-black" disabled={index === product.images.length - 1} onClick={() => handleReorder(index, 'right')}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div 
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all
              ${uploadingImage ? "opacity-50 cursor-not-allowed bg-muted/20" : "cursor-pointer border-border hover:border-[#2d7a4f] hover:bg-[#2d7a4f]/5"}
            `}
          >
            {uploadingImage ? (
              <Loader2 className="h-6 w-6 animate-spin text-[#2d7a4f]" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground/60" />
                <span className="text-[11px] font-semibold text-muted-foreground">Add Image</span>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// NUTRITIONS SECTION
// ----------------------------------------------------------------------
function NutritionsSection({ product, onUpdate }: { product: any; onUpdate: () => void }) {
  const [selectedNutritions, setSelectedNutritions] = useState<{ nutritionId: string; name: string; slug: string; value: number | string; unit: string; icon?: string | null }[]>(
    product.nutritions || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [allNutritions, setAllNutritions] = useState<Nutrition[]>([]);
  const [loadingNutritions, setLoadingNutritions] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Derived dirty check
  const originalStr = JSON.stringify(product.nutritions || []);
  const currentStr = JSON.stringify(selectedNutritions.map(n => ({ nutritionId: n.nutritionId, value: Number(n.value), unit: n.unit })));
  const isDirty = originalStr !== currentStr;

  useEffect(() => {
    setSelectedNutritions(product.nutritions || []);
  }, [product.nutritions]);

  useEffect(() => {
    if (!dropdownOpen) return;
    setLoadingNutritions(true);
    const timer = setTimeout(async () => {
      try {
        const res = await nutritionService.getNutritions({ search: searchText || undefined, limit: 50, isActive: true, status: "approved" });
        setAllNutritions(res?.data?.items || []);
      } catch {
        setAllNutritions([]);
      } finally {
        setLoadingNutritions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dropdownOpen, searchText]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);

  const selectedIds = new Set(selectedNutritions.map((n) => n.nutritionId));

  const filteredNutritions = allNutritions.filter(
    (n) => !selectedIds.has(n.id) &&
      (searchText === "" || n.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleSelect = (nt: Nutrition) => {
    if (!selectedIds.has(nt.id)) {
      setSelectedNutritions((prev) => [...prev, { nutritionId: nt.id, name: nt.name, slug: nt.slug, value: "", unit: nt.defaultUnit || "g", icon: nt.icon }]);
    }
    setSearchText("");
    setDropdownOpen(false);
  };

  const handleRemove = (id: string) => {
    setSelectedNutritions((prev) => prev.filter((n) => n.nutritionId !== id));
  };

  const handleChange = (id: string, field: "value" | "unit", val: string) => {
    setSelectedNutritions((prev) =>
      prev.map((n) => (n.nutritionId === id ? { ...n, [field]: val } : n))
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payloadNutritions = selectedNutritions.map((n) => ({
        nutritionId: n.nutritionId,
        value: Number(n.value) || 0,
        unit: n.unit || "g"
      }));
      await productService.updateProduct(product.id, { nutritions: payloadNutritions });
      toast.success("Nutritions updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update nutritions");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <CardHeader title="Nutritional Info" isDirty={isDirty} isSubmitting={isSubmitting} onSave={handleSave} />
      <div className="p-5 space-y-4">

        {/* Selected nutritions list */}
        <div className="space-y-3">
          {selectedNutritions.length === 0 && (
            <p className="text-[11px] text-muted-foreground/60 italic">No nutritional information added yet.</p>
          )}
          {selectedNutritions.map((nt) => (
            <div key={nt.nutritionId} className="flex flex-col gap-1.5 p-3 rounded-xl border border-border/60 bg-muted/5 relative group">
              <button
                type="button"
                onClick={() => handleRemove(nt.nutritionId)}
                className="absolute top-2 right-2 rounded-full bg-destructive/10 text-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              
              <div className="flex items-center gap-2 mb-1">
                {nt.icon && nt.icon !== "" ? (
                  <img src={nt.icon} alt={nt.name} className="w-4 h-4 object-contain" />
                ) : (
                  <Scale className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs font-bold">{nt.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={nt.value} 
                    onChange={(e) => handleChange(nt.nutritionId, "value", e.target.value)} 
                    placeholder="Value (e.g. 15.5)" 
                    className="h-8 text-xs" 
                  />
                </div>
                <div className="w-20">
                  <Input 
                    value={nt.unit} 
                    onChange={(e) => handleChange(nt.nutritionId, "unit", e.target.value)} 
                    placeholder="Unit" 
                    className="h-8 text-xs" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Searchable dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-muted-foreground hover:border-[#2d7a4f]/50 hover:text-foreground transition-all text-left"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">Search or add nutrition...</span>
            <Plus className="h-3.5 w-3.5 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setDropdownOpen(false); setSearchText(""); }
                  }}
                  placeholder="Search nutrition..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
                {searchText && (
                  <button onClick={() => setSearchText("")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto">
                {loadingNutritions ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2d7a4f]" />
                  </div>
                ) : (
                  <>
                    {filteredNutritions.map((nt) => (
                      <button
                        key={nt.id}
                        type="button"
                        onClick={() => handleSelect(nt)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-muted/40 transition-colors"
                      >
                        {nt.icon && nt.icon !== "" ? (
                          <img src={nt.icon} alt={nt.name} className="w-4 h-4 object-contain shrink-0" />
                        ) : (
                          <Scale className="h-4 w-4 text-[#2d7a4f] shrink-0" />
                        )}
                        <span className="flex-1 font-medium">{nt.name}</span>
                        <span className="text-[10px] text-muted-foreground">({nt.defaultUnit})</span>
                      </button>
                    ))}

                    {filteredNutritions.length === 0 && (
                      <p className="text-[12px] text-muted-foreground/60 text-center py-5">
                        {searchText ? "No matching nutrition found" : "All available nutritions already added"}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export function ProductDetailsModule({ productId }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      const res = await productService.getProductById(productId);
      if (res.ok) setProduct(res.data);
      else throw new Error("Failed to load product");
    } catch (err: any) {
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [productId]);

  if (loading) return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f]" />
    </div>
  );

  if (error || !product) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.push("/products")}><ArrowLeft className="h-4 w-4 mr-2"/> Back</Button>
      <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3"><ShieldAlert className="h-6 w-6" /> {error || "Not found"}</div>
    </div>
  );

  const primaryImage = product.images?.[0]?.url ? getS3ImageUrl(product.images[0].url) : null;
  const isDeleted = !!product.deletedAt;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-muted/20 overflow-hidden">
      {/* STICKY HEADER */}
      <div className="bg-card border-b border-border/60 px-6 py-4 flex flex-col shadow-sm z-10 shrink-0">
        <div className="flex items-center mb-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/products")} className="-ml-3 h-8 gap-1.5 text-muted-foreground hover:text-foreground font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Button>
        </div>

        <div className="flex items-start gap-5">
          <div className="shrink-0 h-16 w-16 sm:h-20 sm:w-20 bg-muted/40 rounded-xl border border-border/60 overflow-hidden flex items-center justify-center shadow-sm">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-foreground truncate leading-none tracking-tight">
                {product.name}
              </h1>
              {isDeleted ? (
                <Badge variant="destructive" className="h-6 shadow-sm">Deleted</Badge>
              ) : (
                <StatusBadge value={product.status} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs sm:text-sm">
              {product.slug && (
                <span className="font-mono text-[10px] sm:text-xs bg-muted/60 px-2 py-0.5 rounded-md border border-border/60 text-muted-foreground">
                  /{product.slug}
                </span>
              )}
              {product.category?.name && (
                <div className="flex items-center gap-1.5 text-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/40">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-xs">{product.category.name}</span>
                </div>
              )}
              {product.chef?.chefProfile?.businessName && (
                <div className="flex items-center gap-1.5 text-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/40">
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-xs">{product.chef.chefProfile.businessName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        {isDeleted && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-bold text-sm">This product is deleted</p>
              <p className="text-xs opacity-90 mt-0.5 font-medium">It is no longer visible to customers. Restore it from the actions menu above.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full max-w-[1600px] mx-auto">
          
          {/* LEFT COLUMN: Basic, Specs, Images */}
          <div className="xl:col-span-2 space-y-6">
            <BasicInfoSection product={product} onUpdate={fetchProduct} />
            <ImagesSection product={product} onUpdate={fetchProduct} />
            <SpecsSection product={product} onUpdate={fetchProduct} />
          </div>

          {/* RIGHT COLUMN: Pricing, Tags, Keywords, Nutritions */}
          <div className="space-y-6">
            <PricingSection product={product} onUpdate={fetchProduct} />
            <TagsSection product={product} onUpdate={fetchProduct} />
            <KeywordsSection product={product} onUpdate={fetchProduct} />
            <NutritionsSection product={product} onUpdate={fetchProduct} />
          </div>

        </div>
      </div>
    </div>
  );
}
