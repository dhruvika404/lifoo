"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  Trash2,
  FileText,
  Percent,
  MapPin,
  User,
  Package,
  CloudSun,
  Calendar,
  Sparkles,
  Layers,
  FolderHeart,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  cityService,
  categoryService,
  chefService,
  productService,
  PricingRule,
  City,
  Chef,
  Product,
} from "@/services";
import { pricingRuleSchema, type PricingRuleFormValues } from "@/schemas/pricing";

// ─── Helpers for datetime-local (YYYY-MM-DDTHH:MM) ──────────────────────────

function apiToLocalDatetime(isoString?: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

function localDatetimeToApi(localString?: string | null): string | null {
  if (!localString) return null;
  const date = new Date(localString);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

interface AddEditPricingRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule: PricingRule | null;
  onSave: (payload: any) => Promise<void>;
}

export function AddEditPricingRuleModal({
  open,
  onOpenChange,
  editingRule,
  onSave,
}: AddEditPricingRuleModalProps) {
  const mode = editingRule ? "edit" : "create";

  // Data sources for condition dropdowns
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Active condition keys currently added
  const [activeConditionKeys, setActiveConditionKeys] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<PricingRuleFormValues>({
    resolver: zodResolver(pricingRuleSchema) as any,
    defaultValues: {
      name: "",
      type: "SURCHARGE",
      priority: 0,
      isActive: true,
      validFrom: "",
      validUntil: "",
      target: "DELIVERY_FEE",
      percentageValue: 0,
      flatAmount: 0,
      conditions: {
        cityId: null,
        categoryId: null,
        chefId: null,
        productId: null,
        weather: null,
      },
    },
  });

  const selectedTarget = watch("target");
  const watchConditions = watch("conditions");

  // Re-validate conditions object whenever any condition value changes (after first submission)
  const condValues = JSON.stringify(watchConditions);
  useEffect(() => {
    if (open && isSubmitted) {
      trigger("conditions");
    }
  }, [condValues, trigger, open, isSubmitted]);

  // Load dropdown resources on mount
  useEffect(() => {
    async function loadResources() {
      try {
        const [citiesRes, catsRes, chefsRes, prodsRes] = await Promise.allSettled([
          cityService.getCities({ limit: 100 }),
          categoryService.getCategories({ limit: 200 }),
          chefService.getChefs({ limit: 1000 }),
          productService.getProducts({ limit: 1000 }),
        ]);

        if (citiesRes.status === "fulfilled" && citiesRes.value.ok) {
          setCities(citiesRes.value.data?.items ?? []);
        }
        if (catsRes.status === "fulfilled" && catsRes.value.ok) {
          const catData = catsRes.value.data;
          setCategories(Array.isArray(catData) ? catData : (catData?.items ?? []));
        }
        if (chefsRes.status === "fulfilled" && chefsRes.value.ok) {
          const chefData = chefsRes.value.data;
          setChefs(Array.isArray(chefData) ? chefData : (chefData?.items ?? []));
        }
        if (prodsRes.status === "fulfilled" && prodsRes.value.ok) {
          setProducts(prodsRes.value.data?.items ?? []);
        }
      } catch (e) {
        console.error("Failed to load dialog resources", e);
      }
    }

    if (open) {
      loadResources();
    }
  }, [open]);

  // Populate/Reset form (Runs exactly once when the modal is opened/editingRule changes)
  useEffect(() => {
    if (open) {
      if (editingRule) {
        // Build active keys list
        const activeKeys: string[] = [];
        const conds = editingRule.conditions || {};
        if (conds.cityId) activeKeys.push("cityId");
        if (conds.categoryId) activeKeys.push("categoryId");
        if (conds.chefId) activeKeys.push("chefId");
        if (conds.productId) activeKeys.push("productId");
        if (conds.weather) activeKeys.push("weather");
        setActiveConditionKeys(activeKeys);

        // Map actions value to fields
        let percentageValue: number | undefined = undefined;
        let flatAmount: number | undefined = undefined;

        if (
          editingRule.target === "PLATFORM_MARKUP" ||
          editingRule.target === "SETTLEMENT_COMMISSION"
        ) {
          percentageValue = editingRule.actions?.value;
        } else {
          flatAmount = editingRule.actions?.valuePaisa
            ? editingRule.actions.valuePaisa / 100
            : undefined;
        }

        reset({
          name: editingRule.name,
          type: editingRule.type as any,
          priority: editingRule.priority ?? 0,
          isActive: editingRule.isActive,
          validFrom: apiToLocalDatetime(editingRule.validFrom),
          validUntil: apiToLocalDatetime(editingRule.validUntil),
          target: editingRule.target as any,
          percentageValue: percentageValue ?? 0,
          flatAmount: flatAmount ?? 0,
          conditions: {
            cityId: conds.cityId || null,
            categoryId: conds.categoryId || null,
            chefId: conds.chefId || null,
            productId: conds.productId || null,
            weather: conds.weather || null,
          },
        });
      } else {
        setActiveConditionKeys([]);
        reset({
          name: "",
          type: "SURCHARGE",
          priority: 0,
          isActive: true,
          validFrom: "",
          validUntil: "",
          target: "DELIVERY_FEE",
          percentageValue: 0,
          flatAmount: 0,
          conditions: {
            cityId: null,
            categoryId: null,
            chefId: null,
            productId: null,
            weather: null,
          },
        });
      }
    }
  }, [open, editingRule, reset]);

  // Handle condition addition
  const handleAddCondition = (key: string) => {
    if (!activeConditionKeys.includes(key)) {
      setActiveConditionKeys([...activeConditionKeys, key]);
    }
  };

  // Handle condition removal
  const handleRemoveCondition = (key: string) => {
    setActiveConditionKeys(activeConditionKeys.filter((k) => k !== key));
    setValue(`conditions.${key}` as any, null, { shouldValidate: true });
  };

  const onSubmit = async (values: PricingRuleFormValues) => {
    try {
      // 1. Construct actions payload
      const actions: Record<string, any> = {};
      if (values.target === "PLATFORM_MARKUP" || values.target === "SETTLEMENT_COMMISSION") {
        actions.value = values.percentageValue ?? 0;
      } else if (values.target === "DELIVERY_FEE") {
        actions.type = "FLAT";
        actions.valuePaisa = Math.round((values.flatAmount ?? 0) * 100);
      } else if (values.target === "PLATFORM_FEE") {
        actions.type = "FLAT";
        const valPaisa = Math.round((values.flatAmount ?? 0) * 100);
        actions.valuePaisa = valPaisa;
        actions.value = valPaisa; // satisfy both evaluation engines
      }

      // 2. Construct conditions payload (only active conditions)
      const conditions: Record<string, any> = {};
      for (const key of activeConditionKeys) {
        const val = (values.conditions as any)[key];
        if (val) {
          conditions[key] = val;
        }
      }

      // 3. Assemble full payload
      const payload: Omit<PricingRule, "id" | "createdAt" | "updatedAt"> = {
        name: values.name,
        type: values.type,
        priority: values.priority ?? 0,
        isActive: values.isActive,
        target: values.target,
        validFrom: localDatetimeToApi(values.validFrom),
        validUntil: localDatetimeToApi(values.validUntil),
        conditions,
        actions,
      };

      if (mode === "edit" && editingRule) {
        const patch: Record<string, any> = {};

        if (payload.name !== editingRule.name) patch.name = payload.name;
        if (payload.type !== editingRule.type) patch.type = payload.type;
        if (payload.priority !== editingRule.priority) patch.priority = payload.priority;
        if (payload.isActive !== editingRule.isActive) patch.isActive = payload.isActive;
        if (payload.target !== editingRule.target) patch.target = payload.target;

        const normalizeDate = (d?: string | null) => d ? new Date(d).toISOString() : null;

        try {
          const normPayloadFrom = normalizeDate(payload.validFrom);
          const normRuleFrom = normalizeDate(editingRule.validFrom);
          if (normPayloadFrom !== normRuleFrom) {
            patch.validFrom = payload.validFrom;
          }
        } catch {
          if (payload.validFrom !== editingRule.validFrom) {
            patch.validFrom = payload.validFrom;
          }
        }

        try {
          const normPayloadUntil = normalizeDate(payload.validUntil);
          const normRuleUntil = normalizeDate(editingRule.validUntil);
          if (normPayloadUntil !== normRuleUntil) {
            patch.validUntil = payload.validUntil;
          }
        } catch {
          if (payload.validUntil !== editingRule.validUntil) {
            patch.validUntil = payload.validUntil;
          }
        }

        // Compare actions
        const actionsChanged =
          JSON.stringify(payload.actions) !== JSON.stringify(editingRule.actions || {});
        if (actionsChanged) {
          patch.actions = payload.actions;
        }

        // Compare conditions
        const condsChanged =
          JSON.stringify(payload.conditions) !== JSON.stringify(editingRule.conditions || {});
        if (condsChanged) {
          patch.conditions = payload.conditions;
        }

        // If no fields have changed, DO NOT call API
        if (Object.keys(patch).length === 0) {
          toast.success("No changes detected.");
          onOpenChange(false);
          return;
        }

        await onSave(patch);
      } else {
        await onSave(payload);
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save pricing rule");
    }
  };

  // Get list of condition options that haven't been added yet
  const availableConditionKeys = [
    { key: "cityId", label: "City" },
    { key: "categoryId", label: "Category" },
    { key: "chefId", label: "Chef" },
    { key: "productId", label: "Product" },
    { key: "weather", label: "Weather" },
  ].filter((opt) => !activeConditionKeys.includes(opt.key));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto border-border rounded-xl shadow-xl p-0 gap-0"
      >
        <DialogHeader className="px-6 py-4.5 border-b border-border/50 bg-muted/20">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-[#2d7a4f]" />
            {mode === "edit" ? "Edit Pricing Rule" : "Create Pricing Rule"}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
            {mode === "edit"
              ? "Update rule configurations, targets, and criteria."
              : "Create a rule to adjust pricing automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
          {/* ─── SECTION A: Basic Info ─── */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5 border-b border-border/40 pb-1">
              <FileText className="h-3.5 w-3.5 text-[#2d7a4f]" />
              <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                Basic Info
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Rule Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-0.5">
                  Rule Name <span className="text-destructive font-bold text-xs">*</span>
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Surat Diwali Surcharge, Monsoon Promo"
                  className="h-9 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-xs rounded-lg bg-background"
                />
                {errors.name && (
                  <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Rule Type */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-0.5">
                    Rule Type <span className="text-destructive font-bold text-xs">*</span>
                  </label>
                  <Select
                    value={watch("type")}
                    onValueChange={(val) => setValue("type", val as any, { shouldValidate: true })}
                  >
                    <SelectTrigger className="!h-9 rounded-lg border-border/60 focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-xs w-full bg-background cursor-pointer">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="border-border">
                      <SelectItem value="SURCHARGE" className="cursor-pointer text-xs">Surcharge (Add value)</SelectItem>
                      <SelectItem value="DISCOUNT" className="cursor-pointer text-xs">Discount (Reduce value)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.type.message}</p>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-0.5">
                    Priority <span className="text-destructive font-bold text-xs">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 10"
                    className="h-9 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-xs rounded-lg text-left bg-background"
                    {...register("priority", { valueAsNumber: true })}
                  />
                  {errors.priority && (
                    <p className="text-[10px] text-destructive font-medium mt-0.5">
                      {errors.priority.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Start Date
                  </label>
                  <Input
                    type="datetime-local"
                    className="h-9 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-xs rounded-lg bg-background"
                    {...register("validFrom")}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> End Date
                  </label>
                  <Input
                    type="datetime-local"
                    className="h-9 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-xs rounded-lg bg-background"
                    {...register("validUntil")}
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between border border-border/50 rounded-lg p-2.5 bg-muted/10">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-foreground/80">Rule Status</span>
                  <p className="text-[10px] text-muted-foreground">Toggle to enable/disable this rule immediately</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("isActive", !watch("isActive"))}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d7a4f]/25 ${watch("isActive") ? "bg-[#2d7a4f]" : "bg-muted-foreground/30"
                    }`}
                >
                  <span
                    className={`pointer-events-none block h-4.5 w-4.5 rounded-full bg-background shadow-md ring-0 transition-transform duration-200 ${watch("isActive") ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ─── SECTION B: Target & Actions ─── */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5 border-b border-border/40 pb-1">
              <Layers className="h-3.5 w-3.5 text-[#2d7a4f]" />
              <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                Target & Adjustment Action
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Target Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-0.5">
                  Adjustment Target <span className="text-destructive font-bold text-xs">*</span>
                </label>
                <Select
                  value={selectedTarget}
                  onValueChange={(val) => {
                    setValue("target", val as any, { shouldValidate: true });
                    setValue("percentageValue", 0);
                    setValue("flatAmount", 0);
                  }}
                >
                  <SelectTrigger className="!h-9 rounded-lg border-border/60 focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f] text-xs w-full bg-background cursor-pointer">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    <SelectItem value="DELIVERY_FEE" className="cursor-pointer text-xs">Delivery Fee (Flat ₹)</SelectItem>
                    <SelectItem value="PLATFORM_FEE" className="cursor-pointer text-xs">Platform Fee (Flat ₹)</SelectItem>
                    <SelectItem value="PLATFORM_MARKUP" className="cursor-pointer text-xs">Platform Markup (%)</SelectItem>
                    <SelectItem value="SETTLEMENT_COMMISSION" className="cursor-pointer text-xs">Settlement Commission (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Adjustment Value */}
              <div className="space-y-1">
                {(selectedTarget === "PLATFORM_MARKUP" || selectedTarget === "SETTLEMENT_COMMISSION") && (
                  <>
                    <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-0.5">
                      Percentage Value (%) <span className="text-destructive font-bold text-xs">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 15.00"
                        className="h-9 pr-8 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-xs rounded-lg text-left bg-background"
                        {...register("percentageValue", { valueAsNumber: true })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none pointer-events-none">
                        %
                      </span>
                    </div>
                    {errors.percentageValue && (
                      <p className="text-[10px] text-destructive font-medium mt-0.5">
                        {errors.percentageValue.message}
                      </p>
                    )}
                  </>
                )}

                {(selectedTarget === "DELIVERY_FEE" || selectedTarget === "PLATFORM_FEE") && (
                  <>
                    <label className="text-[11px] font-bold text-foreground/75 flex items-center gap-0.5">
                      Flat Amount (₹) <span className="text-destructive font-bold text-xs">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 40.00"
                        className="h-9 pl-7 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-xs rounded-lg text-left bg-background"
                        {...register("flatAmount", { valueAsNumber: true })}
                      />
                    </div>
                    {errors.flatAmount && (
                      <p className="text-[10px] text-destructive font-medium mt-0.5">
                        {errors.flatAmount.message}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── SECTION C: Conditions ─── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-1 gap-4">
              <div className="flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-[#2d7a4f]" />
                <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-0.5">
                  Conditions <span className="text-destructive font-bold text-xs">*</span>
                </h3>
              </div>

              {availableConditionKeys.length > 0 && (
                <Select value="" onValueChange={handleAddCondition}>
                  <SelectTrigger className="h-7.5 border-[#2d7a4f] text-[#2d7a4f] hover:bg-[#2d7a4f]/5 text-[11px] gap-1 py-1 px-2.5 cursor-pointer rounded-lg bg-background font-semibold shrink-0 w-auto">
                    <Plus className="h-3 w-3 mr-0.5" /> Add Condition
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    {availableConditionKeys.map((c) => (
                      <SelectItem key={c.key} value={c.key} className="cursor-pointer text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {errors.conditions && (
              <p className="text-[10px] text-destructive font-bold mt-1.5 animate-in fade-in-50">
                {((errors.conditions as any).message || (errors.conditions as any).root?.message)}
              </p>
            )}

            {activeConditionKeys.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border/60 rounded-xl bg-muted/5 flex flex-col items-center justify-center gap-0.5 mt-3.5">
                <p className="text-xs font-bold text-muted-foreground">
                  Global Rule
                </p>
                <p className="text-[10px] text-muted-foreground/80 max-w-sm">
                  This rule currently has no matching criteria, applying globally to all orders.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-3.5">
                {activeConditionKeys.map((key) => {
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card relative hover:border-[#2d7a4f]/30 transition-all shadow-xs animate-in fade-in-50 duration-150"
                    >
                      {/* Left Side: Category Icon Badge */}
                      <div className="flex items-center gap-2 min-w-[85px] shrink-0">
                        <span className="p-1 rounded bg-[#2d7a4f]/10 text-[#2d7a4f] shrink-0">
                          {key === "cityId" && <MapPin className="h-3.5 w-3.5" />}
                          {key === "categoryId" && <FolderHeart className="h-3.5 w-3.5" />}
                          {key === "chefId" && <User className="h-3.5 w-3.5" />}
                          {key === "productId" && <Package className="h-3.5 w-3.5" />}
                          {key === "weather" && <CloudSun className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-[11px] font-bold text-foreground/85">
                          {key === "cityId" && "City"}
                          {key === "categoryId" && "Category"}
                          {key === "chefId" && "Chef"}
                          {key === "productId" && "Product"}
                          {key === "weather" && "Weather"}
                        </span>
                      </div>

                      {/* Middle: Selection Dropdown Field */}
                      <div className="flex-1 min-w-0">
                        {/* City Select */}
                        {key === "cityId" && (
                          <Select
                            value={watchConditions.cityId || ""}
                            onValueChange={(val) =>
                              setValue("conditions.cityId", val || null, { shouldValidate: true })
                            }
                          >
                            <SelectTrigger className="!h-9 border-border/60 text-xs w-full bg-background cursor-pointer">
                              <SelectValue placeholder="Select a city..." />
                            </SelectTrigger>
                            <SelectContent className="border-border">
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id} className="cursor-pointer text-xs">
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Category Select */}
                        {key === "categoryId" && (
                          <Select
                            value={watchConditions.categoryId || ""}
                            onValueChange={(val) =>
                              setValue("conditions.categoryId", val || null, { shouldValidate: true })
                            }
                          >
                            <SelectTrigger className="!h-9 border-border/60 text-xs w-full bg-background cursor-pointer">
                              <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent className="border-border">
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id} className="cursor-pointer text-xs">
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Weather Select */}
                        {key === "weather" && (
                          <Select
                            value={watchConditions.weather || ""}
                            onValueChange={(val) =>
                              setValue("conditions.weather", val || null, { shouldValidate: true })
                            }
                          >
                            <SelectTrigger className="!h-9 border-border/60 text-xs w-full bg-background cursor-pointer">
                              <SelectValue placeholder="Select weather status..." />
                            </SelectTrigger>
                            <SelectContent className="border-border">
                              <SelectItem value="RAIN" className="cursor-pointer text-xs">Rainy Weather</SelectItem>
                              <SelectItem value="STORM" className="cursor-pointer text-xs">Stormy / High Winds</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {/* Chef Select Dropdown */}
                        {key === "chefId" && (
                          <Select
                            value={watchConditions.chefId || ""}
                            onValueChange={(val) =>
                              setValue("conditions.chefId", val || null, { shouldValidate: true })
                            }
                          >
                            <SelectTrigger className="!h-9 border-border/60 text-xs w-full bg-background cursor-pointer">
                              <SelectValue placeholder="Select a chef..." />
                            </SelectTrigger>
                            <SelectContent className="border-border">
                              {chefs.map((chef) => (
                                <SelectItem key={chef.userId} value={chef.userId} className="cursor-pointer text-xs">
                                  {chef.displayName} {chef.businessName ? `(${chef.businessName})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Product Select Dropdown */}
                        {key === "productId" && (
                          <Select
                            value={watchConditions.productId || ""}
                            onValueChange={(val) =>
                              setValue("conditions.productId", val || null, { shouldValidate: true })
                            }
                          >
                            <SelectTrigger className="!h-9 border-border/60 text-xs w-full bg-background cursor-pointer">
                              <SelectValue placeholder="Select a product..." />
                            </SelectTrigger>
                            <SelectContent className="border-border">
                              {products.map((prod) => {
                                const chefObj = chefs.find((c) => c.userId === prod.chefId);
                                return (
                                  <SelectItem key={prod.id} value={prod.id} className="cursor-pointer text-xs">
                                    {prod.name} {chefObj ? `(By ${chefObj.displayName})` : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Right Side: Delete Trash Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveCondition(key)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 p-0 rounded-md cursor-pointer transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9.5 text-xs font-bold border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer rounded-lg px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2d7a4f] hover:bg-[#236040] text-white h-9.5 text-xs font-bold gap-1.5 cursor-pointer rounded-lg px-5 shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {mode === "edit" ? "Save Changes" : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
