"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  ShoppingBag,
  AlertCircle,
  Eye,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Receipt,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import { useSlotOrdersStore } from "@/store/slotOrdersStore";
import type { SlotOrder } from "@/services/slot.service";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Status Badge ────────────────────────────────────────────────────────────

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
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Order Item Detail
            </DialogTitle>
            <OrderStatusBadge state={order.orderState || order.state} />
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Order ID: <span className="text-[#2d7a4f] font-semibold">{order.orderId}</span>
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[78vh] p-6 space-y-6">

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-xl border border-border/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <Package className="h-3 w-3" /> Product
              </p>
              <p className="text-sm font-semibold text-foreground">{order.productName ?? "—"}</p>
              {order.variantId && (
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">
                  {order.variantId}
                </p>
              )}
            </div>
            <div className="bg-muted/30 rounded-xl border border-border/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Quantity
              </p>
              <p className="text-2xl font-bold text-foreground">{order.quantity ?? "—"}</p>
            </div>
            <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/20 p-4 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">
                Line Total
              </p>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrencyPaisa(order.lineTotalPaisa)}
              </p>
              {order.quantity != null && order.quantity > 1 && (
                <p className="text-[11px] text-emerald-600/70 mt-0.5">
                  {formatCurrencyPaisa(order.unitPricePaisa)} × {order.quantity}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Customer Info */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#2d7a4f]" />
                Customer
              </h4>
              <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2.5 text-sm">
                <p className="font-semibold text-foreground text-base">
                  {order.customer?.name || "—"}
                </p>
                {order.customer?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
                {order.customer?.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{order.customer.email}</span>
                  </div>
                )}
                {order.customer?.id && (
                  <p className="text-[10px] font-mono text-muted-foreground/60 pt-1 border-t border-border/40">
                    ID: {order.customer.id}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#2d7a4f]" />
                Delivery Address
              </h4>
              {addr ? (
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-1.5 text-sm">
                  {addr.recipient && (
                    <p className="font-semibold text-foreground">{addr.recipient}</p>
                  )}
                  {addr.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{addr.phone}</span>
                    </div>
                  )}
                  <p className="text-muted-foreground">{addr.line1}</p>
                  {addr.line2 && <p className="text-muted-foreground">{addr.line2}</p>}
                  {addr.landmark && (
                    <p className="text-muted-foreground text-xs italic">
                      Near: {addr.landmark}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {[addr.city, addr.pincode].filter(Boolean).join(" – ")}
                  </p>
                  {addr.latitude != null && addr.longitude != null && (
                    <a
                      href={`https://maps.google.com/?q=${addr.latitude},${addr.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2d7a4f] text-xs font-medium hover:underline mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Map
                    </a>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground italic">
                  No delivery address
                </div>
              )}
            </div>
          </div>

          {/* Extra Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#2d7a4f]" />
              Additional Info
            </h4>
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Item State
                  </p>
                  <OrderStatusBadge state={order.state} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Order State
                  </p>
                  <OrderStatusBadge state={order.orderState} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Tamper Seal
                  </p>
                  <p className="text-foreground font-medium">
                    {order.tamperSeal ?? <span className="text-muted-foreground italic">None</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    Delivery
                  </p>
                  <p className="text-foreground font-medium">
                    {order.delivery
                      ? JSON.stringify(order.delivery)
                      : <span className="text-muted-foreground italic">Not assigned</span>}
                  </p>
                </div>
              </div>

              {order.notes ? (
                <div className="pt-3 border-t border-border/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Notes
                  </p>
                  <p className="text-foreground italic">{order.notes}</p>
                </div>
              ) : null}

              <div className="pt-3 border-t border-border/40 flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">
                  Placed: <strong className="text-foreground">{formatDateTime(order.createdAt)}</strong>
                </span>
              </div>

              <div className="pt-1 flex flex-col gap-0.5">
                <p className="text-[10px] font-mono text-muted-foreground/60">
                  Item ID: {order.id}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/60">
                  Order ID: {order.orderId}
                </p>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function SlotOrdersTable({ slotId }: { slotId: string }) {
  const {
    orders,
    total,
    isLoading,
    error,
    page,
    limit,
    fetchOrders,
    setPage,
    setLimit,
    reset,
  } = useSlotOrdersStore();

  const [selectedOrder, setSelectedOrder] = useState<SlotOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (slotId) {
      fetchOrders(slotId, 1, limit);
    }
    return () => {
      reset();
    };
  }, [slotId]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleView = (order: SlotOrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#2d7a4f] opacity-60" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-xl bg-card text-center">
        <ShoppingBag className="h-9 w-9 text-muted-foreground mb-3 opacity-20" />
        <p className="text-sm font-semibold text-foreground">No orders found for this slot.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Orders will appear here once customers place them.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <DataTable
          rows={orders}
          columns={[
            {
              key: "orderId",
              label: "Order ID",
              className: "py-3 px-4",
              render: (o: SlotOrder) => (
                <span className="text-xs font-mono font-semibold text-[#2d7a4f]">
                  {o.orderId || "—"}
                </span>
              ),
            },
            {
              key: "customer",
              label: "Customer",
              className: "py-3 px-4",
              render: (o: SlotOrder) => (
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold text-foreground text-sm">
                    {o.customer?.name || "Guest"}
                  </p>
                  {o.customer?.phone && (
                    <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                  )}
                  {o.customer?.email && (
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {o.customer.email}
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "deliveryAddress",
              label: "Deliver To",
              className: "py-3 px-4",
              render: (o: SlotOrder) => {
                const addr = o.deliveryAddress;
                if (!addr) return <span className="text-muted-foreground text-xs">—</span>;
                return (
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-foreground text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      {addr.recipient || addr.city || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                      {[addr.line1, addr.city, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                );
              },
            },
            {
              key: "quantity",
              label: "Qty",
              className: "py-3 px-4 text-sm font-semibold text-center",
              render: (o: SlotOrder) => (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-bold">
                  {o.quantity ?? "—"}
                </span>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              className: "py-3 px-4",
              render: (o: SlotOrder) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground text-sm">
                    {formatCurrencyPaisa(o.lineTotalPaisa)}
                  </span>
                  {o.quantity != null && o.unitPricePaisa != null && o.quantity > 1 && (
                    <span className="text-[11px] text-muted-foreground">
                      {formatCurrencyPaisa(o.unitPricePaisa)} × {o.quantity}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "date",
              label: "Placed At",
              className: "py-3 px-4",
              render: (o: SlotOrder) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(o.createdAt)}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              className: "py-3 px-4",
              render: (o: SlotOrder) => (
                <div className="flex flex-col gap-1">
                  <OrderStatusBadge state={o.orderState || o.state} />
                  {o.orderState && o.state && o.orderState !== o.state && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Item: {o.state.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              label: "",
              className: "py-3 px-4 text-right w-[60px]",
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

        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => setLimit(l)}
        />
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
