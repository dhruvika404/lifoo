"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Info,
  Loader2,
  Clock,
  Package,
  Users,
  ChefHat,
  MapPin,
  FileText,
  Activity,
  IndianRupee,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { slotService, Slot } from "@/services/slot.service";
import { SlotOrdersTable } from "./slotOrdersTable";
import { useSlotOrdersStore } from "@/store/slotOrdersStore";

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(paisa?: number | null): string {
  if (paisa == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paisa / 100);
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground break-words">
          {value}
        </span>
      </div>
    </div>
  );
}

export function SlotDetailsModule() {
  const params = useParams();
  const router = useRouter();
  const slotId = params?.id as string;

  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slotSummary = useSlotOrdersStore((s) => s.slotSummary);

  const loadSlotData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await slotService.getSlotById(slotId);
      if (response && response.ok) {
        setSlot(response.data);
      } else {
        throw new Error("Failed to retrieve slot details.");
      }
    } catch (err: any) {
      console.error("Error loading slot details:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred while loading slot details."
      );
    } finally {
      setLoading(false);
    }
  }, [slotId]);

  useEffect(() => {
    if (!slotId) return;
    loadSlotData();
  }, [slotId, loadSlotData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f]" />
        <span className="text-sm font-medium animate-pulse">
          Loading slot details...
        </span>
      </div>
    );
  }

  if (error || !slot) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
          <Info className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {error || "We couldn't find the slot you were looking for."}
        </p>
        <Button
          onClick={() => router.push("/slots")}
          className="bg-[#2d7a4f] hover:bg-[#236040] text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Slots List
        </Button>
      </div>
    );
  }

  // State color mapping
  const stateColorMap: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    published: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    cutoff_reached: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    cooking: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    ready_for_pickup: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    complete: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  const stateColor =
    stateColorMap[slot.state] ?? "bg-muted text-muted-foreground border-border";

  const bookedQty = slotSummary?.bookedQuantity ?? slot.capacity - slot.capacityRemaining;
  const capacityPercentage = Math.round((bookedQty / slot.capacity) * 100);
  const totalRevenue = slotSummary?.totalRevenuePaisa;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="flex flex-col gap-3 border-b bg-card px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/slots" className="hover:text-foreground transition-colors">
              Slots
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {slot.id}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Slot Overview{" "}
            <span className="text-muted-foreground text-sm font-mono mt-1">
              #{slot.id}
            </span>
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/slots")}
          className="hover:bg-muted font-semibold text-xs h-8 self-start md:self-auto"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to List
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">

        {/* Hero Card */}
        <div className="relative rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-card">
          <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-start gap-6 justify-between">

            {/* Left: product + chef + state + times */}
            <div className="space-y-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stateColor}`}
                >
                  {slot.state.replace(/_/g, " ")}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 border border-border/50 px-2 py-0.5 rounded">
                  v{slot.version}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  {slot.product.name}
                </h2>
                <Link
                  href={`/chefs/${slot.chefId}`}
                  className="text-[#2d7a4f] font-medium text-base mt-1 hover:underline flex items-center gap-1.5"
                >
                  <ChefHat className="h-4 w-4" />
                  {slot.chef.name}
                </Link>
              </div>

              {/* Timeline row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Start:{" "}
                    <strong className="text-foreground">
                      {formatDateTime(slot.startAt)}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    Cutoff:{" "}
                    <strong className="text-foreground">
                      {formatDateTime(slot.cutoffAt)}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Package className="h-4 w-4" />
                  <span>
                    Ready By:{" "}
                    <strong className="text-amber-700">
                      {formatDateTime(slot.readyBy)}
                    </strong>
                  </span>
                </div>
                {slot.lastCancellationAt && (
                  <div className="flex items-center gap-1.5 text-rose-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Last Cancel:{" "}
                      <strong className="text-rose-600">
                        {formatDateTime(slot.lastCancellationAt)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Capacity + Revenue stats */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0">
              {/* Capacity */}
              <div className="flex flex-col items-center justify-center bg-muted/40 p-5 rounded-xl border border-border/50 min-w-[170px]">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium text-sm">
                  <Users className="h-4 w-4" />
                  Slot Capacity
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {bookedQty}{" "}
                  <span className="text-base text-muted-foreground font-normal">
                    / {slot.capacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full transition-all ${
                      capacityPercentage >= 90
                        ? "bg-rose-500"
                        : capacityPercentage >= 70
                        ? "bg-amber-500"
                        : "bg-[#2d7a4f]"
                    }`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {capacityPercentage}% Booked
                </div>
              </div>

              {/* Revenue */}
              {totalRevenue != null && (
                <div className="flex flex-col items-center justify-center bg-emerald-500/5 p-5 rounded-xl border border-emerald-500/20 min-w-[170px]">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 font-medium text-sm">
                    <IndianRupee className="h-4 w-4" />
                    Total Revenue
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="text-xs text-emerald-600/70 mt-1">
                    from {bookedQty} order{bookedQty !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Lifecycle Timestamps */}
          <Card className="border border-border/50 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#2d7a4f]" />
                Lifecycle Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Created At"
                value={formatDateTime(slot.createdAt)}
              />
              <Separator />
              <InfoRow
                icon={<Activity className="h-4 w-4" />}
                label="Published At"
                value={
                  slot.publishedAt ? (
                    <span className="text-blue-600">{formatDateTime(slot.publishedAt)}</span>
                  ) : (
                    <span className="text-muted-foreground">Not published</span>
                  )
                }
              />
              <Separator />
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="Cooking Started At"
                value={
                  slot.cookingStartedAt ? (
                    <span className="text-orange-600">{formatDateTime(slot.cookingStartedAt)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )
                }
              />
              <Separator />
              <InfoRow
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Completed At"
                value={
                  slot.completedAt ? (
                    <span className="text-emerald-600">{formatDateTime(slot.completedAt)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )
                }
              />
              <Separator />
              <InfoRow
                icon={<XCircle className="h-4 w-4" />}
                label="Cancelled At"
                value={
                  slot.cancelledAt ? (
                    <span className="text-rose-600">{formatDateTime(slot.cancelledAt)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )
                }
              />
              <Separator />
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="Last Updated"
                value={formatDateTime(slot.updatedAt)}
              />
            </CardContent>
          </Card>

          {/* Slot Meta */}
          <Card className="border border-border/50 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-[#2d7a4f]" />
                Slot Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              <InfoRow
                icon={<Hash className="h-4 w-4" />}
                label="Slot ID"
                value={
                  <span className="font-mono text-xs break-all">{slot.id}</span>
                }
              />
              <Separator />
              <InfoRow
                icon={<Package className="h-4 w-4" />}
                label="Product"
                value={
                  <Link
                    href={`/products/${slot.productId}`}
                    className="text-[#2d7a4f] hover:underline"
                  >
                    {slot.product.name}
                  </Link>
                }
              />
              <Separator />
              <InfoRow
                icon={<ChefHat className="h-4 w-4" />}
                label="Chef"
                value={
                  <Link
                    href={`/chefs/${slot.chefId}`}
                    className="text-[#2d7a4f] hover:underline"
                  >
                    {slot.chef.name}
                  </Link>
                }
              />
              <Separator />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Address ID"
                value={
                  <span className="font-mono text-xs break-all">
                    {slot.addressId}
                  </span>
                }
              />
              <Separator />
              <InfoRow
                icon={<ShoppingCart className="h-4 w-4" />}
                label="Variant ID"
                value={
                  slot.variantId ? (
                    <span className="font-mono text-xs break-all">
                      {slot.variantId}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )
                }
              />
              <Separator />
              {slot.cancellationReason && (
                <>
                  <InfoRow
                    icon={<XCircle className="h-4 w-4" />}
                    label="Cancellation Reason"
                    value={
                      <span className="text-rose-600">
                        {slot.cancellationReason}
                      </span>
                    }
                  />
                  <Separator />
                </>
              )}
              <InfoRow
                icon={<FileText className="h-4 w-4" />}
                label="Notes"
                value={
                  slot.notes ? (
                    <span className="whitespace-pre-wrap">{slot.notes}</span>
                  ) : (
                    <span className="text-muted-foreground italic">No notes</span>
                  )
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Orders Table Section */}
        <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#2d7a4f]" />
                Slot Orders
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage orders and fulfillments specific to this slot run.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <SlotOrdersTable slotId={slotId} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
