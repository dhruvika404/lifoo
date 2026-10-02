"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/pageShell";
import { Loader2, MapPin } from "lucide-react";
import { useCustomerStore } from "@/store/customerStore";
import type { Customer } from "@/services/customer.service";
import toast from "react-hot-toast";

interface ViewCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
}

export function ViewCustomerModal({
  open,
  onOpenChange,
  customerId,
}: ViewCustomerModalProps) {
  const getCustomer = useCustomerStore((state) => state.getCustomer);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      setIsLoading(true);
      getCustomer(customerId)
        .then((data) => {
          setCustomer(data);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load customer details");
          onOpenChange(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setCustomer(null);
    }
  }, [open, customerId, getCustomer, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border/60 bg-muted/30">
          <DialogTitle className="text-xl font-semibold">
            Customer Details
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-[#2d7a4f] mb-4" />
              <p>Loading customer information...</p>
            </div>
          ) : customer ? (
            <div className="p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {customer.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span>{customer.phone}</span>
                    {customer.email && (
                      <>
                        <span>•</span>
                        <span>{customer.email}</span>
                      </>
                    )}
                  </div>
                </div>
                <StatusBadge value={customer.status} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/20 p-4 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Joined
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {customer.joinedAt
                      ? new Date(customer.joinedAt).toLocaleDateString()
                      : customer.joined
                      ? new Date(customer.joined).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Total Spend
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    ₹{customer.totalSpend?.toLocaleString("en-IN") || 0}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Wallet Balance
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    ₹{customer.wallet?.toLocaleString("en-IN") || 0}
                  </p>
                </div>
              </div>

              {/* Addresses */}
              {customer.addresses && customer.addresses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Saved Addresses ({customer.addresses.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customer.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 rounded-xl border border-border/60 bg-card hover:border-[#2d7a4f]/40 transition-colors relative"
                      >
                        {address.isDefault && (
                          <Badge
                            variant="secondary"
                            className="absolute top-3 right-3 text-[10px] bg-[#2d7a4f]/10 text-[#2d7a4f] hover:bg-[#2d7a4f]/20"
                          >
                            Default
                          </Badge>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="mt-1 bg-muted p-1.5 rounded-md">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm capitalize flex items-center gap-2">
                              {address.type || "Address"}
                            </p>
                            <p className="text-sm text-foreground mt-1">
                              {address.recipient}
                              <span className="text-muted-foreground ml-2">
                                {address.phone}
                              </span>
                            </p>
                            <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
                              <p>{address.line1}</p>
                              {address.line2 && <p>{address.line2}</p>}
                              {address.landmark && (
                                <p className="text-xs italic">
                                  Landmark: {address.landmark}
                                </p>
                              )}
                              <p>
                                {address.city}, {address.state} {address.pincode}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Customer details not available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
