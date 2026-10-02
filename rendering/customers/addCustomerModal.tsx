"use client";

import React from "react";
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

const addCustomerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  wallet: z
    .number({ message: "Wallet balance must be a number" })
    .min(0, "Wallet balance cannot be negative"),
  status: z.enum(["Active", "Suspended", "Blocked"]),
});

export type AddCustomerFormValues = z.infer<typeof addCustomerFormSchema>;

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (values: AddCustomerFormValues) => void;
}

export function AddCustomerModal({ open, onOpenChange, onAdd }: AddCustomerModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCustomerFormValues>({
    resolver: zodResolver(addCustomerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      wallet: 0,
      status: "Active",
    },
  });

  const statusValue = watch("status");

  const onSubmit = (data: AddCustomerFormValues) => {
    onAdd(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>
            Create a new customer account, wallet, and configure their initial status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <label htmlFor="add-customer-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Customer Name <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="add-customer-name"
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
            <label htmlFor="add-customer-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Email Address <span className="text-destructive font-bold">*</span>
            </label>
            <Input
              id="add-customer-email"
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
              <label htmlFor="add-customer-phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Phone Number <span className="text-destructive font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                <Input
                  id="add-customer-phone"
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
              <label htmlFor="add-customer-wallet" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Wallet Balance (₹) <span className="text-destructive font-bold">*</span>
              </label>
              <Input
                id="add-customer-wallet"
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
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
              Add Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
