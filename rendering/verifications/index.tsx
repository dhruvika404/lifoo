"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Layers, CheckCircle2, Clock, AlertCircle, RotateCcw, FileEdit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody } from "@/components/pageShell";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/use-debounce";

import { ProfileTab } from "./profileTab";
import { BankDetailsTab } from "./bankDetailsTab";
import { DocumentsTab } from "./documentsTab";
import { MenuTab } from "./menuTab";
import { MultipleKitchenTab } from "./multipleKitchenTab";
import { MultipleStoveTab } from "./multipleStoveTab";

import { useVerificationStore } from "@/store/verificationStore";
import type { VerificationStatus, ReviewPayload } from "@/services/verification.service";

type ActiveTab =
  | "profile"
  | "bank_details"
  | "documents"
  | "menu"
  | "multiple_kitchen"
  | "multiple_stove";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "resubmission", label: "Resubmission" },
];

export function VerificationsModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  // Pagination for Multiple Kitchen
  const [kitchenPage, setKitchenPage] = useState(1);
  const [kitchenLimit, setKitchenLimit] = useState(10);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const {
    profiles,
    bankAccounts,
    documents,
    products,
    kitchenAddresses,
    kitchenAddressesLoading,
    kitchenAddressesTotal,
    stoves,
    stovesLoading,
    isReviewing,
    profilesStatusCounts,
    bankAccountsStatusCounts,
    documentsStatusCounts,
    productsStatusCounts,
    kitchenAddressesStatusCounts,
    stovesStatusCounts,
    fetchProfiles,
    fetchBankAccounts,
    fetchDocuments,
    fetchProducts,
    fetchKitchenAddresses,
    fetchStoves,
    reviewProfileAddress,
    reviewBankAccount,
    reviewDocument,
    reviewProduct,
    reviewKitchenAddress,
    reviewStove,
  } = useVerificationStore();

  const getStatusParam = (): VerificationStatus | undefined =>
    statusFilter === "all" ? undefined : (statusFilter as VerificationStatus);

  // Reset pagination when switching search query or status filter or active tab
  useEffect(() => {
    setKitchenPage(1);
  }, [debouncedSearch, statusFilter, activeTab]);

  useEffect(() => {
    const status = getStatusParam();
    const search = debouncedSearch || undefined;

    if (activeTab === "profile") {
      fetchProfiles({ search, status });
    } else if (activeTab === "bank_details") {
      fetchBankAccounts({ search, status });
    } else if (activeTab === "documents") {
      fetchDocuments({ search, status });
    } else if (activeTab === "menu") {
      fetchProducts({ search, status });
    } else if (activeTab === "multiple_kitchen") {
      fetchKitchenAddresses({ search, status, page: kitchenPage, limit: kitchenLimit });
    } else if (activeTab === "multiple_stove") {
      fetchStoves({ search, status, limit: 20 });
    }
  }, [
    activeTab,
    debouncedSearch,
    statusFilter,
    kitchenPage,
    kitchenLimit,
  ]);

  const handleReview = useCallback(
    async (
      type: "profile" | "bank" | "document" | "product" | "kitchen" | "stove",
      id: string,
      payload: ReviewPayload
    ) => {
      try {
        if (type === "profile") await reviewProfileAddress(id, payload);
        else if (type === "bank") await reviewBankAccount(id, payload);
        else if (type === "document") await reviewDocument(id, payload);
        else if (type === "product") await reviewProduct(id, payload);
        else if (type === "kitchen") await reviewKitchenAddress(id, payload);
        else await reviewStove(id, { action: payload.action as "approve" | "reject", reason: payload.reason });

        const actionLabel =
          payload.action === "approve"
            ? "approved ✅"
            : payload.action === "reject"
            ? "rejected ❌"
            : "flagged for resubmission 🔄";

        toast.success(`Verification ${actionLabel} successfully`);

        const status = getStatusParam();
        const search = debouncedSearch || undefined;

        if (type === "profile") fetchProfiles({ search, status });
        else if (type === "bank") fetchBankAccounts({ search, status });
        else if (type === "document") fetchDocuments({ search, status });
        else if (type === "product") fetchProducts({ search, status });
        else if (type === "kitchen")
          fetchKitchenAddresses({ search, status, page: kitchenPage, limit: kitchenLimit });
        else fetchStoves({ search, status, limit: 20 });
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Review action failed";
        toast.error(msg);
      }
    },
    [debouncedSearch, statusFilter, kitchenPage, kitchenLimit]
  );

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "bank_details", label: "Bank Details" },
    { id: "documents", label: "Documents" },
    { id: "menu", label: "Menu" },
    { id: "multiple_kitchen", label: "Multiple Kitchen" },
    { id: "multiple_stove", label: "Multiple Stove" },
  ];

  const currentStatusCounts =
    activeTab === "profile"
      ? profilesStatusCounts
      : activeTab === "bank_details"
      ? bankAccountsStatusCounts
      : activeTab === "documents"
      ? documentsStatusCounts
      : activeTab === "menu"
      ? productsStatusCounts
      : activeTab === "multiple_kitchen"
      ? kitchenAddressesStatusCounts
      : stovesStatusCounts;

  const renderStateBoxes = () => {
    const counts = currentStatusCounts || {
      pending: 0,
      approved: 0,
      rejected: 0,
      ...(activeTab !== "multiple_stove" ? { resubmission: 0 } : {}),
    };

    const totalCount = Object.values(counts).reduce((a, b) => (typeof b === "number" ? a + b : a), 0);

    const boxes = [
      {
        value: "all",
        label: "Total Submissions",
        count: totalCount,
        colorClass: "text-foreground",
        bgClass: "bg-card",
        activeBorderClass: "border-slate-400 shadow-sm ring-1 ring-slate-400/20",
        icon: Layers,
      },
    ];

    if (counts.pending !== undefined)
      boxes.push({
        value: "pending",
        label: "Pending",
        count: counts.pending,
        colorClass: "text-slate-600",
        bgClass: "bg-slate-50/50",
        activeBorderClass: "border-slate-400 shadow-sm ring-1 ring-slate-400/20",
        icon: Clock,
      });
    if (counts.approved !== undefined)
      boxes.push({
        value: "approved",
        label: "Approved",
        count: counts.approved,
        colorClass: "text-emerald-600",
        bgClass: "bg-emerald-50/50",
        activeBorderClass: "border-emerald-500 shadow-sm ring-1 ring-emerald-500/20",
        icon: CheckCircle2,
      });
    if (counts.rejected !== undefined)
      boxes.push({
        value: "rejected",
        label: "Rejected",
        count: counts.rejected,
        colorClass: "text-red-600",
        bgClass: "bg-red-50/50",
        activeBorderClass: "border-red-500 shadow-sm ring-1 ring-red-500/20",
        icon: AlertCircle,
      });
    if (counts.resubmission !== undefined && activeTab !== "multiple_stove")
      boxes.push({
        value: "resubmission",
        label: "Resubmission",
        count: counts.resubmission,
        colorClass: "text-amber-600",
        bgClass: "bg-amber-50/50",
        activeBorderClass: "border-amber-500 shadow-sm ring-1 ring-amber-500/20",
        icon: RotateCcw,
      });
    if (activeTab === "menu" && counts.draft !== undefined)
      boxes.push({
        value: "draft",
        label: "Draft",
        count: counts.draft,
        colorClass: "text-slate-600",
        bgClass: "bg-slate-50/50",
        activeBorderClass: "border-slate-400 shadow-sm ring-1 ring-slate-400/20",
        icon: FileEdit,
      });

    const gridColsClass =
      boxes.length === 4 ? "lg:grid-cols-4" :
      boxes.length === 5 ? "lg:grid-cols-5" :
      "lg:grid-cols-6";

    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 ${gridColsClass} gap-3 mb-6`}>
        {boxes.map((box) => {
          const isActive = statusFilter === box.value;
          const Icon = box.icon;
          return (
            <button
              key={box.value}
              onClick={() => setStatusFilter(box.value)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${box.bgClass} ${
                isActive ? box.activeBorderClass : "border-border hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${box.colorClass}`} />
              <div>
                <p className={`text-lg font-bold leading-none ${box.colorClass}`}>{box.count}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{box.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-background min-h-screen pb-12">
      <PageHeader
        title="Verifications"
        description="Verify chef compliance and kitchen details before activation"
      />

      <PageBody>
        <div className="flex border-b border-border mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#2d7a4f] text-[#2d7a4f]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === "multiple_kitchen"
                  ? "Search kitchen address, city, chef..."
                  : activeTab === "multiple_stove"
                  ? "Search stove specifications, chef..."
                  : "Search chef..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full bg-card rounded-lg border-border"
            />
          </div>
        </div>

        {renderStateBoxes()}

        {activeTab === "profile" && (
          <ProfileTab
            profiles={profiles}
            isReviewing={isReviewing}
            onReview={(id, payload) => handleReview("profile", id, payload)}
          />
        )}
        {activeTab === "bank_details" && (
          <BankDetailsTab
            bankAccounts={bankAccounts}
            isReviewing={isReviewing}
            onReview={(id, payload) => handleReview("bank", id, payload)}
          />
        )}
        {activeTab === "documents" && (
          <DocumentsTab
            documents={documents}
            isReviewing={isReviewing}
            onReview={(id, payload) => handleReview("document", id, payload)}
            statusFilter={statusFilter}
          />
        )}
        {activeTab === "menu" && (
          <MenuTab
            products={products}
            isReviewing={isReviewing}
            onReview={(id, payload) => handleReview("product", id, payload)}
          />
        )}
        {activeTab === "multiple_kitchen" && (
          <MultipleKitchenTab
            kitchenAddresses={kitchenAddresses}
            isLoading={kitchenAddressesLoading}
            isReviewing={isReviewing}
            totalItems={kitchenAddressesTotal}
            page={kitchenPage}
            limit={kitchenLimit}
            onPageChange={setKitchenPage}
            onLimitChange={setKitchenLimit}
            onReview={(id, payload) => handleReview("kitchen", id, payload)}
          />
        )}
        {activeTab === "multiple_stove" && (
          <MultipleStoveTab
            stoves={stoves}
            isLoading={stovesLoading}
            isReviewing={isReviewing}
            totalItems={stoves.length}
            onReview={(id, payload) => handleReview("stove", id, payload)}
          />
        )}
      </PageBody>
    </div>
  );
}
