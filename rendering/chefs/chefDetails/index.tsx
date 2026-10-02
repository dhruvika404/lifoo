"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Info,
  Loader2,
  Percent,
  Star,
  Phone,
  Globe,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chefService, ChefDetail, ChefDocument, ChefBankAccount } from "@/services";
import toast from "react-hot-toast";

import { ChefProfileSection } from "./components/chefProfileSection";
import { ChefBankSection } from "./components/chefBankSection";
import { ChefDocumentsSection } from "./components/chefDocumentsSection";
import { ChefAddressSection } from "./components/chefAddressSection";
import { ChefOnboardingTracker } from "./components/chefOnboardingTracker";
import { ChefAccountStats } from "./components/chefAccountStats";
import { ChefAuditLogsTab } from "./components/chefAuditLogsTab";

export function ChefDetailsModule() {
  const params = useParams();
  const router = useRouter();
  const chefId = params?.id as string;

  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAddressTab, setActiveAddressTab] = useState<"kitchen" | "residential">("kitchen");
  const [approving, setApproving] = useState(false);

  const loadChefData = useCallback(async (showOverlay = true) => {
    if (showOverlay) setLoading(true);
    setError(null);
    try {
      const response = await chefService.getChefById(chefId);
      if (response && response.ok) {
        setChef(response.data);
      } else {
        throw new Error("Failed to retrieve chef details from the server.");
      }
    } catch (err: any) {
      console.error("Error loading chef details:", err);
      setError(err?.response?.data?.message || err?.message || "An error occurred while loading chef details.");
    } finally {
      if (showOverlay) setLoading(false);
    }
  }, [chefId]);

  useEffect(() => {
    if (!chefId) return;
    loadChefData();
  }, [chefId, loadChefData]);

  const handleApproveAddress = async () => {
    if (!chefId || !chef?.pendingKitchen?.id) {
      toast.error("No pending kitchen address found to approve.");
      return;
    }
    setApproving(true);
    try {
      const response = await chefService.approveAddress(chefId, chef.pendingKitchen.id);
      if (response && response.ok) {
        toast.success("Kitchen address approved successfully!");
        await loadChefData(false);
      } else {
        throw new Error("Failed to approve kitchen address.");
      }
    } catch (err: any) {
      console.error("Error approving kitchen address:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve kitchen address.");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f]" />
        <span className="text-sm font-medium animate-pulse">Loading chef details...</span>
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
          <Info className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {error || "We couldn't find the chef you were looking for."}
        </p>
        <Button onClick={() => router.push("/chefs")} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chefs List
        </Button>
      </div>
    );
  }

  const initials = chef.displayName
    ? chef.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "CH";

  const documentsList: ChefDocument[] = chef.documents || chef.kycDocuments || [];
  const bankAccountsList: ChefBankAccount[] = chef.bankAccounts || [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col gap-3 border-b bg-card px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/chefs" className="hover:text-foreground transition-colors">
              Chefs
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {chef.businessName || "Chef Profile"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {chef.businessName || "Chef Profile"}
          </h1>
        </div>

        <Button variant="outline" size="sm" onClick={() => router.push("/chefs")} className="hover:bg-muted font-semibold text-xs h-8 self-start md:self-auto">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to List
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="relative rounded-2xl border border-emerald-500/10 overflow-hidden shadow-md bg-[#0f281a] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_-20%,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(52,211,153,0.04),transparent_40%)]" />

          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#2d7a4f] to-[#1b432e] border border-emerald-500/30 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-950/20 shrink-0">
              {initials}
            </div>

            <div className="flex-1 text-center md:text-left space-y-3.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  chef.kycStatus === "verified"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                }`}>
                  KYC: {chef.kycStatus}
                </Badge>
                <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  chef.user?.status === "active"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                }`}>
                  Status: {chef.user?.status || "inactive"}
                </Badge>

                {chef.user?.preferredLocale && (
                  <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border bg-blue-500/10 text-blue-300 border-blue-500/20">
                    <Globe className="h-3 w-3" />
                    Lang: {chef.user.preferredLocale.toUpperCase()}
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {chef.businessName || "Unnamed Kitchen"}
                </h1>
                <p className="text-emerald-400/90 font-medium text-base mt-0.5">
                  {chef.displayName}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-white/70 pt-3.5 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Joined {new Date(chef.joinedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">
                    {chef.ratingAvg !== null && chef.ratingAvg !== undefined ? Number(chef.ratingAvg).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-white/60">({chef.ratingCount} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-300 font-semibold">
                  <Percent className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Commission: {chef.commissionPct}%</span>
                </div>

                {chef.user?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{chef.user.phone}</span>
                  </div>
                )}
                {chef.alternatePhone && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Alt: {chef.alternatePhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChefProfileSection chef={chef} />
            <ChefBankSection bankAccountsList={bankAccountsList} />
            <ChefDocumentsSection documentsList={documentsList} />
            <ChefAddressSection 
              chef={chef}
              activeAddressTab={activeAddressTab}
              setActiveAddressTab={setActiveAddressTab}
              approving={approving}
              handleApproveAddress={handleApproveAddress}
            />
          </div>

          <div className="space-y-6">
            <ChefAccountStats chef={chef} />
            <ChefOnboardingTracker chef={chef} />
          </div>
        </div>

        <div className="mt-8">
          <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2d7a4f]" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ChefAuditLogsTab chefId={chefId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
