"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/pageShell";
import { Loader2, Truck, User, MapPin, MapPinned, Route } from "lucide-react";
import { useDeliveryStore } from "@/store/deliveryStore";
import type { Delivery } from "@/services/delivery.service";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

interface ViewDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId: string | null;
}

export function ViewDeliveryModal({
  open,
  onOpenChange,
  deliveryId,
}: ViewDeliveryModalProps) {
  const getDelivery = useDeliveryStore((state) => state.getDelivery);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && deliveryId) {
      setIsLoading(true);
      getDelivery(deliveryId)
        .then((data) => {
          setDelivery(data);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load delivery details");
          onOpenChange(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDelivery(null);
    }
  }, [open, deliveryId, getDelivery, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              Delivery Details {delivery ? `(#${delivery.id})` : ""}
            </DialogTitle>
            {delivery && <StatusBadge value={delivery.status} />}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] mb-4" />
              <p>Loading delivery information...</p>
            </div>
          ) : delivery ? (
            <div className="p-6 space-y-8">
              {/* Order Context */}
              <div className="bg-muted/20 p-4 rounded-xl border border-border/60 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Associated Order
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {delivery.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Customer Name
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {delivery.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Customer Phone
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {delivery.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Creation Time
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(delivery.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Rider Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4" /> Assigned Rider
                </h4>
                {delivery.rider ? (
                  <div className="p-4 rounded-xl border border-border/60 bg-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center border border-border/60">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{delivery.rider.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{delivery.rider.phone}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                      {delivery.rider.vehicle}
                    </Badge>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-border/60 bg-card flex flex-col items-center justify-center text-center text-muted-foreground">
                    <User className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">No rider assigned yet.</p>
                  </div>
                )}
              </div>

              {/* Routing / Addresses */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Route className="h-4 w-4" /> Route Details
                </h4>
                
                <div className="p-4 rounded-xl border border-border/60 bg-card space-y-6 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[31px] top-[40px] bottom-[40px] w-0.5 bg-border/60 z-0"></div>

                  <div className="flex gap-4 relative z-10">
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 flex items-center justify-center shrink-0 mt-1">
                      <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Pickup Address</p>
                      <p className="text-sm text-muted-foreground">{delivery.pickupAddress.line1}</p>
                      {delivery.pickupAddress.line2 && <p className="text-sm text-muted-foreground">{delivery.pickupAddress.line2}</p>}
                      <p className="text-sm text-muted-foreground">
                        {delivery.pickupAddress.city}, {delivery.pickupAddress.state} {delivery.pickupAddress.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center shrink-0 mt-1">
                      <MapPinned className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Drop-off Address</p>
                      <p className="text-sm text-muted-foreground">{delivery.dropoffAddress.line1}</p>
                      {delivery.dropoffAddress.line2 && <p className="text-sm text-muted-foreground">{delivery.dropoffAddress.line2}</p>}
                      <p className="text-sm text-muted-foreground">
                        {delivery.dropoffAddress.city}, {delivery.dropoffAddress.state} {delivery.dropoffAddress.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {delivery.estimatedDeliveryTime && (
                <div className="flex items-center justify-between p-4 bg-[#2d7a4f]/5 border border-[#2d7a4f]/20 rounded-xl">
                  <span className="text-sm font-medium text-[#2d7a4f]">Estimated Delivery Time</span>
                  <span className="text-sm font-bold text-foreground">
                    {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()}
                  </span>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Delivery details not available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
