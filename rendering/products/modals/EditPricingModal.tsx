"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productService } from "@/services/product.service";

const formSchema = z.object({
  basePricePaisa: z.number().min(1, "Price must be at least ₹0.01"),
  preparationTimeMinutes: z.number().int().min(1, "Must be at least 1 minute"),
  shelfLifeHours: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  weightUnit: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function EditPricingModal({ product, open, onOpenChange, onUpdated }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open && product) {
      reset({
        basePricePaisa: product.basePricePaisa || 0,
        preparationTimeMinutes: product.preparationTimeMinutes || 0,
        shelfLifeHours: product.shelfLifeHours || null,
        weight: product.weight || null,
        weightUnit: product.weightUnit || "",
      });
    }
  }, [open, product, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await productService.updateProduct(product.id, {
        basePricePaisa: Math.round(values.basePricePaisa),
        preparationTimeMinutes: Math.round(values.preparationTimeMinutes),
        shelfLifeHours: values.shelfLifeHours || null,
        weight: values.weight || null,
        weightUnit: values.weightUnit || null,
      });
      toast.success("Pricing & timing updated successfully.");
      onUpdated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update pricing");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pricing & Timing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Price (₹) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                {...register("basePricePaisa", {
                  setValueAs: (v) => (v === "" ? 0 : parseFloat(v) * 100),
                })}
                defaultValue={product?.basePricePaisa ? (product.basePricePaisa / 100).toFixed(2) : ""}
                placeholder="0.00"
                className={errors.basePricePaisa ? "border-destructive" : ""}
              />
              {errors.basePricePaisa && <p className="text-xs text-destructive">{errors.basePricePaisa.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Prep Time (min) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min="1"
                {...register("preparationTimeMinutes", { valueAsNumber: true })}
                placeholder="30"
                className={errors.preparationTimeMinutes ? "border-destructive" : ""}
              />
              {errors.preparationTimeMinutes && <p className="text-xs text-destructive">{errors.preparationTimeMinutes.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Shelf Life (hrs)</label>
              <Input
                type="number"
                min="0"
                {...register("shelfLifeHours", { valueAsNumber: true })}
                placeholder="24"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Weight</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  {...register("weight", { valueAsNumber: true })}
                  placeholder="0"
                  className="flex-1"
                />
                <Input
                  {...register("weightUnit")}
                  placeholder="g/kg"
                  className="w-16 text-center"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2d7a4f] hover:bg-[#236040] text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
