"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pricingConfigSchema, type PricingConfigFormValues } from "@/schemas/pricing";
import { pricingService, PricingRule } from "@/services/pricing.service";
import { PageHeader, PageBody, DataTable } from "@/components/pageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Save,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Settings,
  Sparkles,
  Truck,
  Scale,
  Receipt,
  Clock,
  ChevronDown,
} from "lucide-react";
import { ConfirmationModal } from "@/components/confirmationModal";
import { AddEditPricingRuleModal } from "./addEditPricingRuleModal";
import toast from "react-hot-toast";


const PAISA_FIELDS: (keyof PricingConfigFormValues)[] = [
  "baseDeliveryChargePaisa",
  "additionalChargePerKmPaisa",
  "additionalChargePerKgPaisa",
  "platformFeePaisa",
  "slotTimeChangePenaltyPaisa",
];

function isPaisaField(name: keyof PricingConfigFormValues): boolean {
  return PAISA_FIELDS.includes(name);
}

function apiToForm(apiData: Record<string, any>): PricingConfigFormValues {
  const result = { ...apiData } as any;
  for (const field of PAISA_FIELDS) {
    if (typeof result[field] === "number") {
      result[field] = result[field] / 100;
    }
  }
  return result;
}

function formToApi(formData: Partial<PricingConfigFormValues>): Partial<PricingConfigFormValues> {
  const result = { ...formData } as any;
  for (const field of PAISA_FIELDS) {
    if (typeof result[field] === "number") {
      result[field] = Math.round(result[field] * 100);
    }
  }
  return result;
}


interface FieldDef {
  name: keyof PricingConfigFormValues;
  label: string;
  unit: string;
  step: string;
}

const FIELDS: FieldDef[] = [
  { name: "baseDeliveryChargePaisa", label: "Base Delivery Fee", unit: "₹", step: "0.01" },
  { name: "baseDistanceKm", label: "Base Delivery Distance", unit: "km", step: "0.1" },
  { name: "additionalChargePerKmPaisa", label: "Additional Delivery Charge / KM", unit: "₹", step: "0.01" },
  { name: "includedWeightKg", label: "Included Delivery Weight", unit: "kg", step: "0.5" },
  { name: "additionalChargePerKgPaisa", label: "Additional Charge / Extra KG", unit: "₹", step: "0.01" },
  { name: "maxDeliverableWeightKg", label: "Max Deliverable Weight", unit: "kg", step: "1" },
  { name: "platformFeePaisa", label: "Default Platform Fee", unit: "₹", step: "0.01" },
  { name: "defaultPlatformMarkupPct", label: "Default Platform Markup", unit: "%", step: "0.01" },
  { name: "defaultCommissionPct", label: "Default Commission", unit: "%", step: "0.01" },
  { name: "defaultItemWeightGrams", label: "Default Item Weight", unit: "g", step: "1" },
  { name: "gstPercentage", label: "Global GST Rate", unit: "%", step: "0.01" },
  { name: "gstRateBps", label: "GST Basis Points", unit: "bps", step: "1" },
  { name: "minGapBetweenSlotsMinutes", label: "Min Gap Between Slots", unit: "min", step: "1" },
  { name: "maxSlotTimeChangesPerMonth", label: "Max Slot Time Changes / Month", unit: "", step: "1" },
  { name: "slotTimeChangePenaltyPaisa", label: "Slot Time Change Penalty", unit: "₹", step: "0.01" },
];

const GROUPS = [
  {
    title: "Delivery Fee Defaults",
    description: "Set base costs, base distances, and per-km pricing models.",
    icon: Truck,
    fields: ["baseDeliveryChargePaisa", "baseDistanceKm", "additionalChargePerKmPaisa"],
  },
  {
    title: "Weight Constraints & Surcharges",
    description: "Configure weight limits, extra weight charges, and package specifications.",
    icon: Scale,
    fields: ["includedWeightKg", "additionalChargePerKgPaisa", "maxDeliverableWeightKg", "defaultItemWeightGrams"],
  },
  {
    title: "Platform Fees & Tax Settings",
    description: "Global overrides for platform fees, default margins, commissions, and tax metrics.",
    icon: Receipt,
    fields: ["platformFeePaisa", "defaultPlatformMarkupPct", "defaultCommissionPct", "gstPercentage", "gstRateBps"],
  },
  {
    title: "Slot & Scheduling Settings",
    description: "Control slot cutoff time, change limits per month, and penalty charges for rescheduling.",
    icon: Clock,
    fields: ["defaultSlotCutoffTime", "minGapBetweenSlotsMinutes", "maxSlotTimeChangesPerMonth", "slotTimeChangePenaltyPaisa"],
  },
] as const;

// ─── Helpers for 12h display of HH:MM ───────────────────────────────────────

function format12h(hhmm: string): string {
  if (!hhmm) return "";
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(2, "0")}:${mStr} ${period}`;
}

// ─── Main Module ───

export function PricingConfigModule() {
  const [activeTab, setActiveTab] = useState<"global" | "rules">("global");
  const [slotCutoffValue, setSlotCutoffValue] = useState<string>("");

  // All groups collapsed by default
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (title: string) =>
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));

  // ─── Global Config Tab States ───
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configFetchError, setConfigFetchError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ id?: string; version?: number }>({});
  const originalValuesRef = useRef<Partial<PricingConfigFormValues>>({});

  // ─── Dynamic Rules Tab States ───
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);

  // Filters for Rules
  const [searchQuery, setSearchQuery] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState("all");

  // Modal actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<PricingRule | null>(null);
  const [deletingRule, setDeletingRule] = useState(false);

  // Zod hook form for Global Config
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors: configErrors, isDirty: isConfigDirty },
  } = useForm<PricingConfigFormValues>({
    resolver: zodResolver(pricingConfigSchema),
  });

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Fetch config and rules when tab changes
  useEffect(() => {
    if (activeTab === "rules") {
      fetchRules();
    } else {
      fetchConfig();
    }
  }, [activeTab, targetFilter, isActiveFilter]);

  // Fetch Global Configuration
  async function fetchConfig() {
    setLoadingConfig(true);
    setConfigFetchError(null);
    try {
      const res = await pricingService.getConfig();
      if (res.ok && res.data) {
        const { id, version, ...rest } = res.data;
        setMeta({ id, version });
        const formValues = apiToForm(rest);
        originalValuesRef.current = { ...formValues };
        reset(formValues);
        // Sync local slot cutoff state
        setSlotCutoffValue((formValues as any).defaultSlotCutoffTime ?? "");
      } else {
        setConfigFetchError("Failed to load pricing config.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load pricing config.";
      setConfigFetchError(msg);
      toast.error(msg);
    } finally {
      setLoadingConfig(false);
    }
  }

  // Submit Global Configuration Changes
  async function onConfigSubmit(values: PricingConfigFormValues) {
    setSavingConfig(true);
    try {
      const original = originalValuesRef.current as PricingConfigFormValues;
      const changedRupees = (Object.keys(values) as (keyof PricingConfigFormValues)[]).reduce(
        (acc, key) => {
          if (values[key] !== original[key]) (acc as any)[key] = values[key];
          return acc;
        },
        {} as Partial<PricingConfigFormValues>
      );

      if (Object.keys(changedRupees).length === 0) {
        toast("No changes detected.");
        setSavingConfig(false);
        return;
      }

      const apiPayload = formToApi(changedRupees);
      const res = await pricingService.updateConfig(apiPayload);
      if (res.ok) {
        const { id, version, ...updatedRest } = res.data ?? {};
        if (id || version) setMeta({ id, version });
        const updatedFormValues = apiToForm(updatedRest);
        originalValuesRef.current = { ...updatedFormValues };
        reset(updatedFormValues);
        toast.success("Pricing config saved!");
      } else {
        toast.error("Update failed. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Update failed.");
    } finally {
      setSavingConfig(false);
    }
  }

  // Fetch Dynamic Rules
  async function fetchRules() {
    setLoadingRules(true);
    setRulesError(null);
    try {
      const params: any = {};
      if (isActiveFilter !== "all") params.isActive = isActiveFilter === "active";
      if (targetFilter !== "all") params.target = targetFilter;

      const res = await pricingService.getRules(params);
      if (res.ok && res.data) {
        setRules(res.data.items ?? []);
      } else {
        setRulesError("Failed to fetch pricing rules.");
      }
    } catch (err: any) {
      setRulesError(err?.response?.data?.message || err?.message || "Failed to load pricing rules.");
    } finally {
      setLoadingRules(false);
    }
  }

  // Create/Update Rule Save Handler
  async function handleSaveRule(payload: any) {
    if (editingRule) {
      // Update existing
      const res = await pricingService.updateRule(editingRule.id!, payload);
      if (res.ok) {
        toast.success("Pricing rule updated!");
        setRules((prev) => prev.map((r) => (r.id === editingRule.id ? res.data : r)));
      }
    } else {
      // Create new
      const res = await pricingService.createRule(payload);
      if (res.ok) {
        toast.success("Pricing rule created!");
        setRules((prev) => [res.data, ...prev]);
      }
    }
  }

  // Toggle Rule Status Instant Action
  async function handleToggleRuleStatus(rule: PricingRule) {
    try {
      const updated = await pricingService.updateRule(rule.id!, {
        isActive: !rule.isActive,
      });
      if (updated.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === rule.id ? { ...r, isActive: updated.data.isActive } : r))
        );
        toast.success(`Rule "${rule.name}" ${updated.data.isActive ? "enabled" : "disabled"}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update status");
    }
  }

  // Trigger Delete Confirm Dialog
  const triggerDeleteConfirm = (rule: PricingRule) => {
    setRuleToDelete(rule);
    setIsDeleteConfirmOpen(true);
  };

  // Perform Rule Deletion
  async function handleDeleteRule() {
    if (!ruleToDelete) return;
    setDeletingRule(true);
    try {
      const res = await pricingService.deleteRule(ruleToDelete.id!);
      if (res.ok) {
        toast.success("Pricing rule deleted!");
        setRules((prev) => prev.filter((r) => r.id !== ruleToDelete.id));
        setIsDeleteConfirmOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete pricing rule");
    } finally {
      setDeletingRule(false);
      setRuleToDelete(null);
    }
  }

  // UI Format Helpers
  const formatTarget = (t: string) => {
    switch (t) {
      case "DELIVERY_FEE":
        return "Delivery Fee";
      case "PLATFORM_FEE":
        return "Platform Fee";
      case "PLATFORM_MARKUP":
        return "Platform Markup";
      case "SETTLEMENT_COMMISSION":
        return "Settlement Commission";
      default:
        return t;
    }
  };

  const formatActionValue = (rule: PricingRule) => {
    if (rule.target === "PLATFORM_MARKUP" || rule.target === "SETTLEMENT_COMMISSION") {
      return `${rule.actions?.value ?? 0}%`;
    }
    return `₹${(rule.actions?.valuePaisa ?? 0) / 100}`;
  };

  const formatDateRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) {
      return <span className="text-muted-foreground italic text-xs">Always Active</span>;
    }
    const startStr = start
      ? new Date(start).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";
    const endStr = end
      ? new Date(end).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";
    return (
      <span className="text-xs font-mono">
        {startStr} to {endStr}
      </span>
    );
  };

  const formatConditions = (conditions?: Record<string, any>) => {
    if (!conditions || Object.keys(conditions).length === 0) {
      return <span className="text-muted-foreground italic text-xs">Global</span>;
    }
    return (
      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
        {Object.entries(conditions).map(([k, v]) => {
          if (!v) return null;
          let label = k.replace("Id", "");
          label = label.charAt(0).toUpperCase() + label.slice(1);
          return (
            <span
              key={k}
              className="inline-flex items-center text-[10px] font-bold bg-[#2d7a4f]/5 text-[#2d7a4f] px-2 py-0.5 rounded-full border border-[#2d7a4f]/15 whitespace-nowrap gap-1"
            >
              <span className="font-semibold text-muted-foreground">{label}:</span>
              <span className="truncate max-w-[90px]">{String(v)}</span>
            </span>
          );
        })}
      </div>
    );
  };

  // Client-side search filtering
  const filteredRules = rules.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Pricing Settings"
        description="Configure global pricing defaults and dynamic pricing adjustment rules"
      />

      <PageBody>
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("global")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${activeTab === "global"
                ? "border-[#2d7a4f] text-[#2d7a4f]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            Global Settings
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${activeTab === "rules"
                ? "border-[#2d7a4f] text-[#2d7a4f]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            Dynamic Pricing Rules
          </button>
        </div>

        {/* ─── TAB 1: Global Configurations ─── */}
        {activeTab === "global" && (
          <>
            {configFetchError && !loadingConfig && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {configFetchError}
              </div>
            )}

            {loadingConfig ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onConfigSubmit)} className="space-y-6">
                <div className="space-y-6">
                  {GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    const isOpen = !!expandedGroups[group.title];
                    return (
                      <div
                        key={group.title}
                        className="rounded-2xl border border-border/45 bg-card overflow-hidden shadow-xs"
                      >
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.title)}
                          className={`w-full flex items-center gap-3 px-5 py-4 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer ${isOpen ? "border-b border-border/40" : ""
                            }`}
                        >
                          <span className="p-2 rounded-lg bg-[#2d7a4f]/10 text-[#2d7a4f] shrink-0">
                            <GroupIcon className="h-4.5 w-4.5" />
                          </span>
                          <div className="flex flex-col text-left flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-foreground">
                              {group.title}
                            </h3>
                            <p className="text-[11px] text-muted-foreground">
                              {group.description}
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-border/45">
                            {/* Native time-picker row for defaultSlotCutoffTime */}
                            {(group.fields as readonly string[]).includes("defaultSlotCutoffTime") && (() => {
                              const cutoffError = configErrors["defaultSlotCutoffTime" as keyof PricingConfigFormValues];
                              return (
                                <div className="flex items-center justify-between gap-6 px-5 py-3.5 hover:bg-muted/5 transition-all">
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-sm font-medium text-foreground/90">Default Slot Cutoff Time</span>
                                    <span className="text-[11px] text-muted-foreground">
                                      Orders placed after this time won&apos;t be eligible for same-day slots
                                    </span>
                                    {cutoffError && (
                                      <span className="flex items-center gap-1 text-xs text-destructive">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        {cutoffError.message}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div
                                      className={`relative flex items-center h-9 px-3 rounded-lg border bg-background transition-colors ${cutoffError
                                          ? "border-destructive ring-1 ring-destructive/20"
                                          : "border-border/60 focus-within:border-[#2d7a4f] focus-within:ring-1 focus-within:ring-[#2d7a4f]/20"
                                        }`}
                                    >
                                      <input
                                        id="defaultSlotCutoffTime"
                                        type="time"
                                        value={slotCutoffValue}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setSlotCutoffValue(val);
                                          setValue("defaultSlotCutoffTime", val, { shouldValidate: true, shouldDirty: true });
                                        }}
                                        className="bg-transparent text-sm font-mono text-foreground outline-none cursor-pointer w-32"
                                      />
                                    </div>
                                    {slotCutoffValue && (
                                      <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                                        {format12h(slotCutoffValue)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Regular numeric fields */}
                            {FIELDS.filter((f) =>
                              (group.fields as readonly string[]).includes(f.name) &&
                              f.name !== "defaultSlotCutoffTime"
                            ).map((field) => {
                              const error = configErrors[field.name];

                              return (
                                <div
                                  key={field.name}
                                  className="flex items-center justify-between gap-6 px-5 py-3.5 hover:bg-muted/5 transition-all"
                                >
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-sm font-medium text-foreground/90">
                                      {field.label}
                                    </span>
                                    {error && (
                                      <span className="flex items-center gap-1 text-xs text-destructive">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        {error.message}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="relative flex items-center">
                                      <Input
                                        id={field.name}
                                        type="number"
                                        step={field.step}
                                        min={0}
                                        className={`w-36 h-9 text-sm text-right rounded-lg bg-background ${error
                                            ? "border-destructive focus-visible:ring-destructive/20"
                                            : "border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary"
                                          }`}
                                        {...register(field.name as any, { valueAsNumber: true })}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-10 font-semibold pl-1">
                                      {field.unit}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-5">
                  <Button
                    type="submit"
                    disabled={savingConfig || !isConfigDirty}
                    className="bg-[#2d7a4f] hover:bg-[#236040] text-white h-10 px-5 gap-2 font-bold cursor-pointer disabled:cursor-not-allowed rounded-lg shadow-sm"
                  >
                    {savingConfig ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingConfig ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ─── TAB 2: Dynamic Rules ─── */}
        {activeTab === "rules" && (
          <div className="space-y-4">
            {/* Filters Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
              <div className="flex flex-wrap items-center flex-1 gap-3 max-w-3xl">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by rule name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 border-border/65 rounded-lg text-sm bg-background"
                  />
                </div>

                {/* Target Filter */}
                <Select value={targetFilter} onValueChange={setTargetFilter}>
                  <SelectTrigger className="h-10 w-48 border-border/65 rounded-lg text-xs bg-background cursor-pointer">
                    <SelectValue placeholder="All Targets" />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    <SelectItem value="all" className="cursor-pointer">All Targets</SelectItem>
                    <SelectItem value="DELIVERY_FEE" className="cursor-pointer">Delivery Fee</SelectItem>
                    <SelectItem value="PLATFORM_FEE" className="cursor-pointer">Platform Fee</SelectItem>
                    <SelectItem value="PLATFORM_MARKUP" className="cursor-pointer">Platform Markup</SelectItem>
                    <SelectItem value="SETTLEMENT_COMMISSION" className="cursor-pointer">Settlement Commission</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                  <SelectTrigger className="h-10 w-36 border-border/65 rounded-lg text-xs bg-background cursor-pointer">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    <SelectItem value="all" className="cursor-pointer">All Statuses</SelectItem>
                    <SelectItem value="active" className="cursor-pointer">Active Only</SelectItem>
                    <SelectItem value="inactive" className="cursor-pointer">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Create Action */}
              <Button
                onClick={() => {
                  setEditingRule(null);
                  setIsModalOpen(true);
                }}
                className="bg-[#2d7a4f] hover:bg-[#236040] text-white h-10 px-4 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Create Rule
              </Button>
            </div>

            {/* Error Message */}
            {rulesError && !loadingRules && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {rulesError}
              </div>
            )}

            {/* Table or Loading */}
            {loadingRules ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f]" />
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl bg-card">
                <p className="text-sm text-muted-foreground">No dynamic pricing rules found.</p>
              </div>
            ) : (
              <DataTable<PricingRule>
                rows={filteredRules}
                columns={[
                  {
                    key: "name",
                    label: "Rule Name",
                    className: "font-semibold text-foreground max-w-[150px] truncate",
                  },
                  {
                    key: "type",
                    label: "Type",
                    render: (row) => (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${row.type === "SURCHARGE"
                            ? "bg-rose-500/10 text-rose-700 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                          }`}
                      >
                        {row.type}
                      </span>
                    ),
                  },
                  {
                    key: "target",
                    label: "Target",
                    render: (row) => (
                      <span className="text-xs font-semibold text-foreground/80">
                        {formatTarget(row.target)}
                      </span>
                    ),
                  },
                  {
                    key: "value",
                    label: "Adjustment",
                    render: (row) => (
                      <span className="text-xs font-bold font-mono text-foreground">
                        {formatActionValue(row)}
                      </span>
                    ),
                  },
                  {
                    key: "conditions",
                    label: "Conditions",
                    render: (row) => formatConditions(row.conditions),
                  },

                  {
                    key: "priority",
                    label: "Priority",
                    className: "text-center",
                    render: (row) => (
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        {row.priority}
                      </span>
                    ),
                  },
                  {
                    key: "isActive",
                    label: "Status",
                    className: "w-[150px]",
                    render: (row) => (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRuleStatus(row);
                          }}
                          className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d7a4f]/25 ${row.isActive ? "bg-[#2d7a4f]" : "bg-muted-foreground/30"
                            }`}
                        >
                          <span
                            className={`pointer-events-none block h-4.5 w-4.5 rounded-full bg-background shadow-md ring-0 transition-transform duration-200 ${row.isActive ? "translate-x-4.5" : "translate-x-0.5"
                              }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-semibold select-none ${row.isActive ? "text-[#2d7a4f]" : "text-muted-foreground"
                            }`}
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    className: "text-right w-20",
                    render: (row) => (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingRule(row);
                            setIsModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => triggerDeleteConfirm(row)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer rounded-md"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        )}
      </PageBody>

      {/* Create / Edit Modal Dialog */}
      <AddEditPricingRuleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingRule={editingRule}
        onSave={handleSaveRule}
      />

      {/* Delete Rule Confirmation Dialog */}
      <ConfirmationModal
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Pricing Rule"
        description={`Are you sure you want to delete the pricing rule "${ruleToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deletingRule}
        onConfirm={handleDeleteRule}
      />
    </>
  );
}
