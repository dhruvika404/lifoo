"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  X,
  Check,
  Save,
  Sparkles,
  Gift,
  Filter,
  Trash2,
  Sliders,
  CalendarDays,
  Tag,
  Info,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { promotionFormSchema, type PromotionFormValues } from "@/schemas/promotion";
import { promotionService, Promotion } from "@/services/promotion.service";
import { categoryService, chefService, verificationService, cityService } from "@/services";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Promotion | null;
  onSuccess: () => void;
};

interface SimpleItem {
  id: string;
  name: string;
}

export function PromotionFormModal({ open, onOpenChange, mode, initialData, onSuccess }: Props) {
  const [categories, setCategories] = useState<SimpleItem[]>([]);
  const [chefs, setChefs] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<SimpleItem[]>([]);
  const [cities, setCities] = useState<SimpleItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [activeTab, setActiveTab] = useState<"general" | "rewards" | "rules">("general");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      terms: "",
      code: "",
      displayType: "COUPON",
      promotionType: "DISCOUNT",
      priority: 0,
      isActive: true,
      isStackable: false,
      validFrom: "",
      validUntil: "",
      budgetCap: null,
      maxRedemptions: null,
      maxPerUser: 1,
      minOrderValue: null,
      isFirstOrder: false,
      productIds: [],
      categoryIds: [],
      chefIds: [],
      targetCities: [],
      targetCategories: [],
      targetChefs: [],
      targetSegments: [],
      actionType: "PERCENTAGE_SUBTOTAL",
      value: null,
      valueRupees: null,
      maxDiscountRupees: null,
      buyQuantity: null,
      freeQuantity: null,
      targetProductIds: [],
    },
  });

  const promotionType = watch("promotionType");
  const displayType = watch("displayType");
  const actionType = watch("actionType");

  const selectedCategoryIds = watch("categoryIds") || [];
  const selectedChefIds = watch("chefIds") || [];
  const selectedTargetProductIds = watch("targetProductIds") || [];

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

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [catRes, chefRes, prodRes, cityRes] = await Promise.allSettled([
          categoryService.getCategories({ limit: 100 }),
          chefService.getChefs({ limit: 100 }),
          verificationService.getProducts({ limit: 100 }),
          cityService.getCities({ limit: 100 })
        ]);

        if (catRes.status === "fulfilled" && catRes.value.ok && catRes.value.data) {
          const items = Array.isArray(catRes.value.data) ? catRes.value.data : (catRes.value.data as any).items || [];
          setCategories(items.map((c: any) => ({ id: c.id, name: c.name })));
        } else {
          console.error("Categories fetch failed:", catRes.status === "rejected" ? catRes.reason : catRes.value);
        }

        if (chefRes.status === "fulfilled" && chefRes.value.ok && chefRes.value.data) {
          const items = Array.isArray(chefRes.value.data) ? chefRes.value.data : (chefRes.value.data as any).items || [];
          setChefs(items.map((c: any) => ({ id: c.userId || c.id, name: c.displayName || c.businessName || "Chef" })));
        } else {
          console.error("Chefs fetch failed:", chefRes.status === "rejected" ? chefRes.reason : chefRes.value);
        }

        if (prodRes.status === "fulfilled" && prodRes.value.ok && prodRes.value.data?.items) {
          setProducts(prodRes.value.data.items.map((p: any) => ({ id: p.id, name: p.name })));
        } else {
          console.error("Products fetch failed:", prodRes.status === "rejected" ? prodRes.reason : prodRes.value);
        }

        if (cityRes.status === "fulfilled" && cityRes.value.ok && cityRes.value.data) {
          const items = Array.isArray(cityRes.value.data) ? cityRes.value.data : (cityRes.value.data as any).items || [];
          setCities(items.map((c: any) => ({ id: c.id, name: c.name })));
        } else {
          console.error("Cities fetch failed:", cityRes.status === "rejected" ? cityRes.reason : cityRes.value);
        }
      } catch (err) {
        console.error("Failed to execute loadOptions Promise.allSettled", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [open]);

  useEffect(() => {
    if (!open) {
      reset();
      setActiveTab("general");
      return;
    }

    if (mode === "edit" && initialData) {
      reset({
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        terms: initialData.terms || "",
        code: initialData.code || "",
        displayType: initialData.displayType || "COUPON",
        promotionType: initialData.promotionType || "DISCOUNT",
        priority: initialData.priority ?? 0,
        isActive: initialData.isActive ?? true,
        isStackable: initialData.isStackable ?? false,
        validFrom: toDatetimeLocal(initialData.validFrom),
        validUntil: toDatetimeLocal(initialData.validUntil),
        budgetCap: initialData.budgetCapPaisa ? initialData.budgetCapPaisa / 100 : null,
        maxRedemptions: initialData.maxRedemptions ?? null,
        maxPerUser: initialData.maxPerUser ?? 1,
        minOrderValue: initialData.conditions?.minOrderValue ? initialData.conditions.minOrderValue / 100 : null,
        isFirstOrder: initialData.conditions?.isFirstOrder ?? false,
        productIds: initialData.conditions?.productIds || [],
        // Map targetCategories to categoryIds for UI to bind to a single dropdown
        categoryIds: initialData.conditions?.categoryIds || initialData.conditions?.targetCategories || [],
        chefIds: initialData.conditions?.chefIds || initialData.conditions?.targetChefs || [],
        targetCities: initialData.conditions?.targetCities || [],
        targetSegments: initialData.conditions?.targetSegments || [],
        targetCategories: [],
        targetChefs: [],
        actionType: initialData.actions?.type || "PERCENTAGE_SUBTOTAL",
        value: initialData.actions?.value ?? null,
        valueRupees: initialData.actions?.valuePaisa ? initialData.actions.valuePaisa / 100 : null,
        maxDiscountRupees: initialData.actions?.maxDiscountPaisa ? initialData.actions.maxDiscountPaisa / 100 : null,
        buyQuantity: initialData.actions?.buyQuantity ?? null,
        freeQuantity: initialData.actions?.freeQuantity ?? null,
        targetProductIds: initialData.actions?.targetProductIds || [],
      });
    } else {
      reset({
        title: "",
        subtitle: "",
        terms: "",
        code: "",
        displayType: "COUPON",
        promotionType: "DISCOUNT",
        priority: 0,
        isActive: true,
        isStackable: false,
        validFrom: "",
        validUntil: "",
        budgetCap: null,
        maxRedemptions: null,
        maxPerUser: 1,
        minOrderValue: null,
        isFirstOrder: false,
        productIds: [],
        categoryIds: [],
        chefIds: [],
        targetCities: [],
        targetCategories: [],
        targetChefs: [],
        targetSegments: [],
        actionType: "PERCENTAGE_SUBTOTAL",
        value: null,
        valueRupees: null,
        maxDiscountRupees: null,
        buyQuantity: null,
        freeQuantity: null,
        targetProductIds: [],
      });
    }
  }, [open, mode, initialData, reset]);

  const hasGeneralError = !!(errors.title || errors.code || errors.validFrom || errors.validUntil || errors.priority);
  const hasRewardsError = !!(errors.actionType || errors.value || errors.valueRupees || errors.maxDiscountRupees || errors.buyQuantity || errors.freeQuantity);
  const hasRulesError = !!(errors.minOrderValue || errors.budgetCap || errors.maxRedemptions || errors.maxPerUser || errors.categoryIds);

  const onSubmit = async (values: PromotionFormValues) => {
    const conditions: any = {
      isFirstOrder: values.isFirstOrder,
    };
    if (values.minOrderValue !== null && values.minOrderValue !== undefined) {
      conditions.minOrderValue = Math.round(values.minOrderValue * 100);
    }

    if (values.promotionType === "PLATFORM") {
      conditions.targetCities = values.targetCities || [];
      conditions.targetCategories = values.categoryIds || [];
      conditions.targetChefs = values.chefIds || [];
      conditions.targetSegments = values.targetSegments || [];
    } else if (values.promotionType === "DISCOUNT" || values.promotionType === "FREE_DELIVERY") {
      conditions.categoryIds = values.categoryIds || [];
      conditions.chefIds = values.chefIds || [];
    } else if (values.promotionType === "BOGO") {
      conditions.productIds = values.productIds || [];
    }

    const actions: any = {
      type: values.actionType,
    };
    if (values.actionType === "PERCENTAGE_SUBTOTAL" || values.actionType === "PERCENTAGE_CATEGORY") {
      actions.value = values.value;
      if (values.maxDiscountRupees !== null && values.maxDiscountRupees !== undefined) {
        actions.maxDiscountPaisa = Math.round(values.maxDiscountRupees * 100);
      }
    } else if (values.actionType === "FLAT_SUBTOTAL") {
      if (values.valueRupees !== null && values.valueRupees !== undefined) {
        actions.valuePaisa = Math.round(values.valueRupees * 100);
      }
    } else if (values.actionType === "BOGO") {
      actions.buyQuantity = values.buyQuantity;
      actions.freeQuantity = values.freeQuantity;
      actions.targetProductIds = values.targetProductIds || [];
    }

    const payload: any = {
      title: values.title.trim(),
      subtitle: values.subtitle?.trim() || null,
      terms: values.terms?.trim() || null,
      code: ["COUPON", "BANNER_AND_COUPON"].includes(values.displayType) ? values.code?.trim() || null : null,
      displayType: values.displayType,
      promotionType: values.promotionType,
      priority: Math.round(values.priority),
      isActive: values.isActive,
      isStackable: values.isStackable,
      validFrom: new Date(values.validFrom).toISOString(),
      validUntil: new Date(values.validUntil).toISOString(),
      budgetCapPaisa: values.budgetCap ? Math.round(values.budgetCap * 100) : null,
      maxRedemptions: values.maxRedemptions ? Math.round(values.maxRedemptions) : null,
      maxPerUser: values.maxPerUser ? Math.round(values.maxPerUser) : null,
      conditions,
      actions,
    };

    try {
      if (mode === "create") {
        await promotionService.createPromotion(payload);
        toast.success("Promotion created successfully");
      } else {
        if (!initialData?.id) throw new Error("Missing promotion ID");
        await promotionService.updatePromotion(initialData.id, payload);
        toast.success("Promotion updated successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save promotion");
    }
  };

  const toggleArrayValue = (fieldName: "categoryIds" | "chefIds" | "productIds" | "targetProductIds" | "targetCities", value: string) => {
    const current: string[] = watch(fieldName) || [];
    if (current.includes(value)) {
      setValue(fieldName, current.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue(fieldName, [...current, value], { shouldValidate: true });
    }
  };

  const clearArrayValue = (fieldName: "categoryIds" | "chefIds" | "productIds" | "targetProductIds" | "targetCities") => {
    setValue(fieldName, [], { shouldValidate: true });
  };

  // Section Header Component for clean UI
  const SectionHeader = ({ title, description }: { title: string, description?: string }) => (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-4xl max-h-[90vh] border border-border/60 bg-background shadow-2xl rounded-2xl p-0 gap-0 flex flex-col sm:flex-row overflow-hidden"
      >
        {/* Left Sidebar Wizard Nav */}
        <div className="w-full sm:w-[280px] bg-muted/20 border-r border-border/40 p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                {mode === "create" ? "New Promotion" : "Edit Promotion"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set up your offer details
              </DialogDescription>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "general"
                  ? "bg-background text-emerald-600 shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="h-4.5 w-4.5" />
                Basic Details
              </div>
              {hasGeneralError && <span className="h-2 w-2 rounded-full bg-destructive shadow-sm" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rewards")}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "rewards"
                  ? "bg-background text-emerald-600 shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                }`}
            >
              <div className="flex items-center gap-3">
                <Gift className="h-4.5 w-4.5" />
                Discount & Reward
              </div>
              {hasRewardsError && <span className="h-2 w-2 rounded-full bg-destructive shadow-sm" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "rules"
                  ? "bg-background text-emerald-600 shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="h-4.5 w-4.5" />
                Rules & Limits
              </div>
              {hasRulesError && <span className="h-2 w-2 rounded-full bg-destructive shadow-sm" />}
            </button>
          </nav>
        </div>

        {/* Right Form Area */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-w-0 bg-background h-full max-h-[90vh]">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">

            {/* TAB 1: General Setup */}
            {activeTab === "general" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <SectionHeader
                  title="Basic Details"
                  description="What do you want to call this promotion and where should it appear?"
                />

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                      Campaign Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Diwali Mega Sale 50% Off"
                      className={`h-11 rounded-xl text-sm ${errors.title ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"}`}
                      {...register("title")}
                    />
                    {errors.title && <span className="text-xs text-destructive font-medium">{errors.title.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Short Description (Optional)</label>
                    <Input
                      placeholder="e.g. Valid on all orders above ₹499"
                      className="h-11 rounded-xl text-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                      {...register("subtitle")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                        Where should this appear? <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={displayType}
                        onValueChange={(val: any) => setValue("displayType", val, { shouldValidate: true })}
                      >
                        <SelectTrigger className="!h-11 text-sm rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COUPON">Require a Coupon Code (Users must type it)</SelectItem>
                          <SelectItem value="LIST">List in Menu (Auto-apply / Visible on catalog)</SelectItem>
                          <SelectItem value="BANNER">Top Banner (Highlight on home page)</SelectItem>
                          <SelectItem value="BANNER_AND_COUPON">Banner & Coupon</SelectItem>
                          <SelectItem value="HIDDEN">Hidden (Only applied via special links)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                        Coupon Code {["COUPON", "BANNER_AND_COUPON"].includes(displayType) && <span className="text-destructive">*</span>}
                      </label>
                      <Input
                        placeholder="e.g. SAVE20"
                        disabled={!["COUPON", "BANNER_AND_COUPON"].includes(displayType)}
                        className={`h-11 rounded-xl text-sm uppercase font-mono font-bold ${errors.code ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"} disabled:opacity-50 disabled:bg-muted/50`}
                        {...register("code")}
                      />
                      {errors.code && <span className="text-xs text-destructive font-medium">{errors.code.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-border/40">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                        Start Date & Time <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          onClick={(e) => {
                            try { e.currentTarget.showPicker(); } catch (err) { }
                          }}
                          className={`h-11 pl-10 rounded-xl text-sm cursor-pointer ${errors.validFrom ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"}`}
                          {...register("validFrom")}
                        />
                      </div>
                      {errors.validFrom && <span className="text-xs text-destructive font-medium">{errors.validFrom.message}</span>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                        End Date & Time <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          onClick={(e) => {
                            try { e.currentTarget.showPicker(); } catch (err) { }
                          }}
                          className={`h-11 pl-10 rounded-xl text-sm cursor-pointer ${errors.validUntil ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"}`}
                          {...register("validUntil")}
                        />
                      </div>
                      {errors.validUntil && <span className="text-xs text-destructive font-medium">{errors.validUntil.message}</span>}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <label className="text-sm font-semibold text-foreground">Terms & Conditions (Optional)</label>
                    <textarea
                      placeholder="Detail campaign terms, eligibility restrictions, and redemption rules..."
                      rows={3}
                      className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                      {...register("terms")}
                    />
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: Discounts & Rewards */}
            {activeTab === "rewards" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <SectionHeader
                  title="Discount & Reward"
                  description="Configure what the customer gets when they apply this offer."
                />

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                      What kind of offer is this? <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={promotionType}
                      onValueChange={(val: any) => {
                        setValue("promotionType", val, { shouldValidate: true });
                        if (val === "FREE_DELIVERY") {
                          setValue("actionType", "WAIVE_DELIVERY_FEE", { shouldValidate: true });
                        } else if (val === "BOGO") {
                          setValue("actionType", "BOGO", { shouldValidate: true });
                        } else if (val === "DISCOUNT" || val === "PLATFORM") {
                          setValue("actionType", "PERCENTAGE_SUBTOTAL", { shouldValidate: true });
                        }
                      }}
                    >
                      <SelectTrigger className="h-12 text-sm rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold bg-muted/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLATFORM">Platform-wide Campaign</SelectItem>
                        <SelectItem value="DISCOUNT">Price Discount (e.g. 20% Off, ₹100 Off)</SelectItem>
                        <SelectItem value="FREE_DELIVERY">Free Delivery</SelectItem>
                        <SelectItem value="BOGO">Buy 1 Get 1 (or Buy X Get Y)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-5 rounded-2xl border border-border/60 bg-muted/10 space-y-5">

                    {/* DISCOUNT CONFIG */}
                    {(promotionType === "DISCOUNT" || promotionType === "PLATFORM") && (
                      <div className="space-y-5 animate-in fade-in">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Discount Structure <span className="text-destructive">*</span></label>
                          <Select
                            value={actionType}
                            onValueChange={(val: any) => setValue("actionType", val, { shouldValidate: true })}
                          >
                            <SelectTrigger className="h-11 text-sm rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PERCENTAGE_SUBTOTAL">Percentage % (e.g. 20% Off)</SelectItem>
                              <SelectItem value="FLAT_SUBTOTAL">Flat Amount (e.g. ₹50 Off)</SelectItem>
                              <SelectItem value="PERCENTAGE_CATEGORY">Percentage % Off specific categories</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(actionType === "PERCENTAGE_SUBTOTAL" || actionType === "PERCENTAGE_CATEGORY") && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                                Discount Percentage (%) <span className="text-destructive">*</span>
                              </label>
                              <Input
                                type="number"
                                placeholder="e.g. 20"
                                className={`h-11 rounded-xl text-sm bg-background ${errors.value ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"}`}
                                {...register("value", { valueAsNumber: true })}
                              />
                              {errors.value && <span className="text-xs text-destructive font-medium">{errors.value.message}</span>}
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-foreground">Maximum Discount (₹)</label>
                              <Input
                                type="number"
                                placeholder="e.g. 150 (Leave blank for no limit)"
                                className="h-11 rounded-xl text-sm bg-background focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                {...register("maxDiscountRupees", { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                        )}

                        {actionType === "FLAT_SUBTOTAL" && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                              Flat Discount Amount (₹) <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g. 100"
                              className={`h-11 rounded-xl text-sm bg-background ${errors.valueRupees ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"}`}
                              {...register("valueRupees", { valueAsNumber: true })}
                            />
                            {errors.valueRupees && <span className="text-xs text-destructive font-medium">{errors.valueRupees.message}</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FREE DELIVERY CONFIG */}
                    {promotionType === "FREE_DELIVERY" && (
                      <div className="flex items-center gap-4 py-4 px-2 animate-in fade-in">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">Free Delivery Enabled</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">The delivery fee will be entirely waived for qualifying orders.</p>
                        </div>
                      </div>
                    )}

                    {/* BOGO CONFIG */}
                    {promotionType === "BOGO" && (
                      <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                              Buy Quantity <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g. 2"
                              className={`h-11 rounded-xl text-sm bg-background ${errors.buyQuantity ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"}`}
                              {...register("buyQuantity", { valueAsNumber: true })}
                            />
                            {errors.buyQuantity && <span className="text-xs text-destructive font-medium">{errors.buyQuantity.message}</span>}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                              Get Free Quantity <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g. 1"
                              className={`h-11 rounded-xl text-sm bg-background ${errors.freeQuantity ? "border-destructive focus-visible:ring-destructive/20" : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"}`}
                              {...register("freeQuantity", { valueAsNumber: true })}
                            />
                            {errors.freeQuantity && <span className="text-xs text-destructive font-medium">{errors.freeQuantity.message}</span>}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-foreground">Specific Free Items (Optional)</label>
                            {selectedTargetProductIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => clearArrayValue("targetProductIds")}
                                className="text-xs text-destructive hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Clear All
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 min-h-[44px] p-2 rounded-xl border border-border/70 bg-background">
                            {selectedTargetProductIds.length === 0 ? (
                              <span className="text-sm text-muted-foreground/80 p-1.5 px-2">Customer gets the same item they purchased for free.</span>
                            ) : (
                              selectedTargetProductIds.map(id => {
                                const name = products.find(p => p.id === id)?.name || id;
                                return (
                                  <span key={id} className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg text-sm">
                                    {name}
                                    <button type="button" onClick={() => toggleArrayValue("targetProductIds", id)} className="text-emerald-700 hover:text-emerald-900 rounded-full cursor-pointer transition-colors">
                                      <X className="h-4 w-4" />
                                    </button>
                                  </span>
                                );
                              })
                            )}
                          </div>

                          {products.length > 0 && (
                            <Select onValueChange={(val) => toggleArrayValue("targetProductIds", val)}>
                              <SelectTrigger className="w-full text-sm !h-11 bg-background rounded-xl">
                                <SelectValue placeholder="Select specific products to give away..." />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(p => (
                                  <SelectItem key={p.id} value={p.id}>
                                    <div className="flex items-center justify-between w-full min-w-[200px]">
                                      <span>{p.name}</span>
                                      {selectedTargetProductIds.includes(p.id) && <Check className="h-4 w-4 text-emerald-600" />}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: Eligibility & Limits */}
            {activeTab === "rules" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <SectionHeader
                  title="Rules & Limits"
                  description="Who can use this offer, and what are the restrictions?"
                />

                <div className="space-y-6">

                  {/* Campaign Settings (Toggles) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label htmlFor="isFirstOrder" className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div>
                        <div className="text-sm font-bold text-foreground">First-Time</div>
                        <div className="text-xs text-muted-foreground mt-0.5">New customers</div>
                      </div>
                      <input type="checkbox" id="isFirstOrder" checked={watch("isFirstOrder")} onChange={(e) => setValue("isFirstOrder", e.target.checked, { shouldValidate: true })} className="h-4.5 w-4.5 rounded border-border/70 text-emerald-600 focus:ring-emerald-600 cursor-pointer" />
                    </label>

                    <label htmlFor="isActive" className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div>
                        <div className="text-sm font-bold text-foreground">Active</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Pause campaign</div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${watch("isActive") ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
                        <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${watch("isActive") ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                      </div>
                      <input type="checkbox" id="isActive" className="sr-only" checked={watch("isActive")} onChange={(e) => setValue("isActive", e.target.checked, { shouldValidate: true })} />
                    </label>

                    <label htmlFor="isStackable" className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div>
                        <div className="text-sm font-bold text-foreground">Stackable</div>
                        <div className="text-xs text-muted-foreground mt-0.5">With others</div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${watch("isStackable") ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
                        <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${watch("isStackable") ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                      </div>
                      <input type="checkbox" id="isStackable" className="sr-only" checked={watch("isStackable")} onChange={(e) => setValue("isStackable", e.target.checked, { shouldValidate: true })} />
                    </label>
                  </div>

                  {/* Usage Limits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Min Order (₹)</label>
                      <Input type="number" placeholder="Optional" className="h-11 rounded-xl text-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500" {...register("minOrderValue", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Max Total Uses</label>
                      <Input type="number" placeholder="Global Limit" className="h-11 rounded-xl text-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500" {...register("maxRedemptions", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Uses Per User</label>
                      <Input type="number" placeholder="Per Customer" className="h-11 rounded-xl text-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500" {...register("maxPerUser", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Budget Cap (₹)</label>
                      <Input type="number" placeholder="Overall Cap" className="h-11 rounded-xl text-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500" {...register("budgetCap", { valueAsNumber: true })} />
                    </div>
                  </div>

                  {/* Catalog Filters */}
                  <div className="p-5 rounded-2xl border border-border/60 bg-muted/10 space-y-5">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Filter className="h-4.5 w-4.5 text-emerald-600" /> Catalog Filters
                    </h4>

                    <div className="space-y-6">
                      {/* Cities */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-foreground">Eligible Cities</label>
                          {watch("targetCities")?.length > 0 && (
                            <button type="button" onClick={() => clearArrayValue("targetCities")} title="Clear All" className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <MultiSelect
                          options={cities.map(c => ({ label: c.name, value: c.id }))}
                          selected={watch("targetCities") || []}
                          onChange={(selected) => setValue("targetCities", selected, { shouldValidate: true })}
                          placeholder="Select cities..."
                        />
                      </div>

                      {/* Categories */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-foreground">Eligible Categories</label>
                          {selectedCategoryIds.length > 0 && (
                            <button type="button" onClick={() => clearArrayValue("categoryIds")} title="Clear All" className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <MultiSelect
                          options={categories.map(c => ({ label: c.name, value: c.id }))}
                          selected={selectedCategoryIds}
                          onChange={(selected) => setValue("categoryIds", selected, { shouldValidate: true })}
                          placeholder="Select categories..."
                        />
                      </div>

                      {/* Chefs */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-foreground">Eligible Chefs</label>
                          {selectedChefIds.length > 0 && (
                            <button type="button" onClick={() => clearArrayValue("chefIds")} title="Clear All" className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <MultiSelect
                          options={chefs.map(c => ({ label: c.name, value: c.id }))}
                          selected={selectedChefIds}
                          onChange={(selected) => setValue("chefIds", selected, { shouldValidate: true })}
                          placeholder="Select chefs..."
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Actions */}
          <div className="px-6 sm:px-8 py-5 border-t border-border/60 bg-muted/10 flex flex-row items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              disabled={isSubmitting || loadingOptions}
              onClick={handleSubmit(onSubmit)}
              className="h-11 rounded-xl gap-2 font-bold px-8 text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  {mode === "create" ? "Create Promotion" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
