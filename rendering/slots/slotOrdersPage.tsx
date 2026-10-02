"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Calendar,
  Package,
  Users,
  ShoppingBag,
  Eye,
  MapPin,
  User,
  Phone,
  Mail,
  Receipt,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { PageHeader, PageBody, DataTable } from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSlotOrdersStore } from "@/store/slotOrdersStore";
import { useSlotStore } from "@/store/slotStore";
import type { SlotOrder } from "@/services/slot.service";
import { getS3ImageUrl } from "@/lib/s3-utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function formatCurrencyPaisa(paisa?: number | null): string {
  if (paisa == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paisa / 100);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function OrderStatusBadge({ state }: { state?: string }) {
  const s = state?.toLowerCase() || "unknown";
  const label = state?.replace(/_/g, " ") ?? "Unknown";

  if (s === "pending_payment" || s === "pending") {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 capitalize whitespace-nowrap">
        {label}
      </Badge>
    );
  }
  if (["confirmed", "paid", "completed", "delivered"].includes(s)) {
    return (
      <Badge className="bg-[#00844E] text-white hover:bg-[#006f40] border-0 capitalize">
        {label}
      </Badge>
    );
  }
  if (["cancelled", "failed"].includes(s)) {
    return (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 capitalize">
        {label}
      </Badge>
    );
  }
  if (s === "processing") {
    return (
      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 capitalize">
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="capitalize">
      {label}
    </Badge>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface SlotOrderDetailModalProps {
  order: SlotOrder | null;
  open: boolean;
  onClose: () => void;
}

function SlotOrderDetailModal({ order, open, onClose }: SlotOrderDetailModalProps) {
  if (!order) return null;
  const addr = order.deliveryAddress;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl">

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-[#2d7a4f]/8 via-background to-background px-6 pt-6 pb-5 border-b border-border/50 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#2d7a4f]/10 flex items-center justify-center shrink-0">
                <Receipt className="h-4.5 w-4.5 text-[#2d7a4f]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground leading-tight">
                  {order.productName ?? "Order Item"}
                </DialogTitle>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  {order.orderId}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <OrderStatusBadge state={order.orderState || order.state} />
          </div>

          {/* ── Stats row ── */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-background rounded-xl border border-border/60 px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Qty</p>
              <p className="text-xl font-bold text-foreground">{order.quantity ?? "—"}</p>
            </div>
            <div className="bg-background rounded-xl border border-border/60 px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Unit Price</p>
              <p className="text-base font-bold text-foreground">{formatCurrencyPaisa(order.unitPricePaisa)}</p>
            </div>
            <div className="bg-[#2d7a4f]/5 rounded-xl border border-[#2d7a4f]/20 px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2d7a4f] mb-1">Total</p>
              <p className="text-lg font-bold text-[#2d7a4f]">{formatCurrencyPaisa(order.lineTotalPaisa)}</p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Customer Card */}
            <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/30 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#2d7a4f]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Customer</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="font-semibold text-foreground text-sm">{order.customer?.name || "—"}</p>
                {order.customer?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
                {order.customer?.email && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{order.customer.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/30 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#2d7a4f]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Delivery Address</span>
              </div>
              {addr ? (
                <div className="px-4 py-3 space-y-1.5">
                  {addr.recipient && (
                    <p className="font-semibold text-foreground text-sm">{addr.recipient}</p>
                  )}
                  {addr.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{addr.phone}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {[addr.line1, addr.line2].filter(Boolean).join(", ")}
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      Near: {addr.landmark}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {[addr.city, addr.pincode].filter(Boolean).join(" – ")}
                  </p>
                  {addr.latitude != null && addr.longitude != null && (
                    <a
                      href={`https://maps.google.com/?q=${addr.latitude},${addr.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2d7a4f] text-[11px] font-semibold hover:underline pt-0.5"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Map
                    </a>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-muted-foreground italic">
                  No delivery address provided
                </div>
              )}
            </div>
          </div>

          {/* Notes (only if present) */}
          {order.notes && (
            <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/30 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-[#2d7a4f]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Notes</span>
              </div>
              <p className="px-4 py-3 text-sm text-muted-foreground italic">{order.notes}</p>
            </div>
          )}

          {/* Footer timestamp */}
          <div className="flex items-center gap-2 text-muted-foreground pt-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">
              Placed on <strong className="text-foreground">{formatDateTime(order.createdAt)}</strong>
            </span>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────


export function SlotOrdersPage({ slotId }: { slotId: string }) {
  const router = useRouter();

  const {
    orders,
    total,
    isLoading: ordersLoading,
    error: ordersError,
    page,
    limit,
    fetchOrders,
    setPage,
    setLimit,
    reset,
  } = useSlotOrdersStore();

  const {
    selectedSlot,
    isDetailLoading: slotLoading,
    fetchSlotById,
    clearSelectedSlot,
  } = useSlotStore();

  const [selectedOrder, setSelectedOrder] = useState<SlotOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (slotId) {
      fetchSlotById(slotId);
      fetchOrders(slotId, 1, limit);
    }
    return () => {
      clearSelectedSlot();
      reset();
    };
  }, [slotId]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleView = (order: SlotOrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-background/50 overflow-hidden">
        <div className="bg-card border-b border-border/60 px-6 py-4 flex flex-col shadow-sm z-10 shrink-0">
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="-ml-3 h-8 gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex items-start gap-4">
            <div className="shrink-0 h-16 w-16 sm:h-20 sm:w-20 bg-muted/50 rounded-xl border border-border/60 overflow-hidden flex items-center justify-center shadow-sm">
              {selectedSlot?.product?.images?.[0]?.url ? (
                <img
                  src={getS3ImageUrl(selectedSlot.product.images[0].url) || ""}
                  alt={selectedSlot.product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate leading-none">
                  {selectedSlot ? `Orders for ${selectedSlot.product.name}` : "Slot Orders"}
                </h1>
                {selectedSlot && <OrderStatusBadge state={selectedSlot.state} />}
              </div>

              {selectedSlot && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-mono text-[10px] sm:text-xs bg-muted px-1.5 py-0.5 rounded-md border border-border/60">
                      ID: {slotId}
                    </span>
                  </div>
                  <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Chef: {selectedSlot.chef.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <PageBody className="flex-1 overflow-auto">
          <div className="flex flex-col gap-6">
            {slotLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {selectedSlot && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#2d7a4f]/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-[#2d7a4f]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Product</p>
                    <p className="text-sm font-semibold truncate">{selectedSlot.product.name}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Start Time</p>
                    <p className="text-sm font-semibold truncate">{formatDateTime(selectedSlot.startAt)}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Capacity</p>
                    <p className="text-sm font-semibold truncate">
                      {selectedSlot.capacity - selectedSlot.capacityRemaining} / {selectedSlot.capacity} Booked
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Orders</p>
                    <p className="text-sm font-semibold truncate">{total}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
                <h2 className="text-base font-semibold text-foreground">Order List</h2>
              </div>

              <div className="p-0">
                {ordersError && (
                  <div className="m-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {ordersError}
                  </div>
                )}

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] opacity-60" />
                  </div>
                ) : (
                  <>
                    <DataTable
                      rows={orders}
                      columns={[
                        {
                          key: "orderId",
                          label: "Order ID",
                          className: "py-4 pl-6",
                          render: (o: SlotOrder) => (
                            <span className="text-xs font-mono font-semibold text-[#2d7a4f]">
                              {o.orderId || "—"}
                            </span>
                          ),
                        },
                        {
                          key: "customer",
                          label: "Customer",
                          className: "py-4",
                          render: (o: SlotOrder) => (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-foreground">
                                {o.customer?.name || "Guest"}
                              </span>
                              {o.customer?.email && (
                                <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                  {o.customer.email}
                                </span>
                              )}
                            </div>
                          ),
                        },
                        {
                          key: "phone",
                          label: "Phone",
                          className: "py-4 whitespace-nowrap",
                          render: (o: SlotOrder) => (
                            <span className="text-xs text-muted-foreground">
                              {o.customer?.phone || "—"}
                            </span>
                          ),
                        },
                        {
                          key: "deliveryAddress",
                          label: "Deliver To",
                          className: "py-4",
                          render: (o: SlotOrder) => {
                            const addr = o.deliveryAddress;
                            if (!addr) return <span className="text-muted-foreground text-xs">—</span>;
                            const fullAddress = [
                              addr.line1,
                              addr.line2,
                              addr.landmark ? `Near: ${addr.landmark}` : null,
                              addr.city,
                              addr.pincode,
                            ].filter(Boolean).join(", ");
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 cursor-default">
                                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                      <span className="text-sm font-semibold text-foreground">
                                        {addr.recipient || addr.city || "—"}
                                      </span>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                                    {fullAddress}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          },
                        },
                        {
                          key: "quantity",
                          label: "Qty",
                          className: "py-4 text-center",
                          render: (o: SlotOrder) => (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold">
                              {o.quantity ?? "—"}
                            </span>
                          ),
                        },
                        {
                          key: "amount",
                          label: "Amount",
                          className: "py-4",
                          render: (o: SlotOrder) => (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-foreground">
                                {formatCurrencyPaisa(o.lineTotalPaisa)}
                              </span>
                              {o.quantity != null && o.quantity > 1 && o.unitPricePaisa != null && (
                                <span className="text-[11px] text-muted-foreground">
                                  {formatCurrencyPaisa(o.unitPricePaisa)} × {o.quantity}
                                </span>
                              )}
                            </div>
                          ),
                        },
                        {
                          key: "date",
                          label: "Date",
                          className: "py-4",
                          render: (o: SlotOrder) => (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDateTime(o.createdAt)}
                            </span>
                          ),
                        },
                        {
                          key: "status",
                          label: "Status",
                          className: "py-4",
                          render: (o: SlotOrder) => (
                            <div className="flex flex-col gap-1 w-fit">
                              <OrderStatusBadge state={o.orderState || o.state} />
                              {o.orderState && o.state && o.orderState !== o.state && (
                                <span className="text-[10px] text-muted-foreground">
                                  Item: {o.state.replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
                          ),
                        },
                        {
                          key: "actions",
                          label: "",
                          className: "py-4 pr-6 text-right w-[60px]",
                          render: (o: SlotOrder) => (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(o);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-[#2d7a4f] hover:bg-[#2d7a4f]/8 rounded-lg transition-all duration-150 cursor-pointer"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ),
                        },
                      ]}
                    />

                    {orders.length === 0 && !ordersLoading && !ordersError && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                        <p className="text-sm font-semibold text-foreground">No orders found</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                          There are currently no orders placed for this slot.
                        </p>
                      </div>
                    )}

                    <div className="border-t bg-muted/10 p-4">
                      <TablePagination
                        currentPage={page}
                        totalPages={totalPages}
                        limit={limit}
                        onPageChange={(p) => setPage(p)}
                        onLimitChange={(l) => setLimit(l)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </PageBody>
      </div>

      <SlotOrderDetailModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
}
