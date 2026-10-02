"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/pageShell";
import { Loader2, Receipt, Package, Truck, Clock } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import type { Order } from "@/services/order.service";
import toast from "react-hot-toast";

interface ViewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

export function ViewOrderModal({
  open,
  onOpenChange,
  orderId,
}: ViewOrderModalProps) {
  const getOrder = useOrderStore((state) => state.getOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      setIsLoading(true);
      getOrder(orderId)
        .then((data) => {
          setOrder(data);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load order details");
          onOpenChange(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setOrder(null);
    }
  }, [open, orderId, getOrder, onOpenChange]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Order Details {order ? `(#${order.id})` : ""}
            </DialogTitle>
            {order && <StatusBadge value={order.status} />}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] mb-4" />
              <p>Loading order information...</p>
            </div>
          ) : order ? (
            <div className="p-6 space-y-8">
              {/* Top Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted/20 p-4 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Date & Time
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Payment Method
                  </p>
                  <p className="text-sm font-medium text-foreground uppercase">
                    {order.paymentMethod}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Payment Status
                  </p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {order.paymentStatus}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-[#2d7a4f]">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Customer & Delivery
                  </h4>
                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{order.customer.name}</p>
                      <p className="text-muted-foreground">{order.customer.phone}</p>
                      {order.customer.email && <p className="text-muted-foreground">{order.customer.email}</p>}
                    </div>
                    <div className="pt-3 border-t border-border/40">
                      <p className="font-semibold text-foreground mb-1">Delivery Address</p>
                      <p className="text-muted-foreground">{order.address.line1}</p>
                      {order.address.line2 && <p className="text-muted-foreground">{order.address.line2}</p>}
                      <p className="text-muted-foreground">
                        {order.address.city}, {order.address.state} {order.address.pincode}
                      </p>
                    </div>
                    {order.notes && (
                      <div className="pt-3 border-t border-border/40">
                        <p className="font-semibold text-foreground mb-1">Order Notes</p>
                        <p className="text-muted-foreground italic text-xs">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Package className="h-4 w-4" /> Order Items ({order.items.length})
                  </h4>
                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-4 text-sm">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center pb-3 border-b border-border/40 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-foreground">{item.productName}</p>
                          <p className="text-muted-foreground text-xs">{formatCurrency(item.price)} x {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax</span>
                        <span>{formatCurrency(order.tax)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span>{formatCurrency(order.deliveryFee)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border/40 text-base">
                        <span>Total</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Order details not available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
