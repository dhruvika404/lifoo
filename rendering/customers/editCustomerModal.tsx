"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import type { Customer } from "@/services/customer.service";

const editCustomerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  wallet: z
    .number({ message: "Wallet balance must be a number" })
    .min(0, "Wallet balance cannot be negative"),
  status: z.enum(["active", "suspended", "blocked"]),
});

export type EditCustomerFormValues = z.infer<typeof editCustomerFormSchema>;

interface EditCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onEdit: (id: string, values: EditCustomerFormValues) => void;
}

export function EditCustomerModal({ open, onOpenChange, customer, onEdit }: EditCustomerModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditCustomerFormValues>({
    resolver: zodResolver(editCustomerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      wallet: 0,
      status: "active",
    },
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (open && customer) {
      const cleanPhone = customer.phone ? customer.phone.replace(/[^\d]/g, "").slice(-10) : "";
      reset({
        name: customer.name || "",
        email: customer.email || "",
        phone: cleanPhone,
        wallet: customer.wallet || 0,
        status: customer.status || "active",
      });
    }
  }, [open, customer, reset]);

  const onSubmit = (data: EditCustomerFormValues) => {
    if (!customer) return;
    onEdit(customer.id, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer name, email, phone number, wallet balance, and system status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <label htmlFor="edit-customer-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Customer Name <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="edit-customer-name"
              placeholder="e.g. Aarav Sharma"
              className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                errors.name ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
              }`}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-customer-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Email Address <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="edit-customer-email"
              type="email"
              placeholder="e.g. customer@example.com"
              className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                errors.email ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="edit-customer-phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Phone Number <span className="text-destructive font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                <Input
                  id="edit-customer-phone"
                  placeholder="9876543210"
                  className={`h-10 rounded-lg border border-border/60 bg-background pl-12 pr-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                    errors.phone ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
                  }`}
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-customer-wallet" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Wallet Balance (₹) <span className="text-destructive font-bold">*</span>
              </label>
              <Input
                id="edit-customer-wallet"
                type="number"
                placeholder="0"
                className={`h-10 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                  errors.wallet ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
                }`}
                {...register("wallet", { valueAsNumber: true })}
              />
              {errors.wallet && (
                <p className="text-xs font-medium text-destructive">{errors.wallet.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Status <span className="text-destructive font-bold">*</span>
            </label>
            <Select
              value={statusValue}
              onValueChange={(val) =>
                setValue("status", val as any, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-10 rounded-lg border border-border/60 bg-background focus:ring-[#2d7a4f]/20 focus:border-[#2d7a4f]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs font-medium text-destructive">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#225c3c] font-semibold text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
