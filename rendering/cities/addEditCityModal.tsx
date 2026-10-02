"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { City } from "@/services/city.service";

const cityFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  isActive: z.boolean(),
});

type CityFormValues = z.infer<typeof cityFormSchema>;

interface AddEditCityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCity: City | null;
  onSave: (payload: any) => Promise<void>;
}

export function AddEditCityModal({
  open,
  onOpenChange,
  editingCity,
  onSave,
}: AddEditCityModalProps) {
  const mode = editingCity ? "edit" : "create";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      state: "",
      country: "India",
      isActive: true,
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name in create mode
  useEffect(() => {
    if (mode === "create" && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [nameValue, setValue, mode]);

  // Reset/populate form on dialog state change
  useEffect(() => {
    if (open) {
      if (editingCity) {
        reset({
          name: editingCity.name,
          slug: editingCity.slug,
          state: editingCity.state,
          country: editingCity.country,
          isActive: editingCity.isActive,
        });
      } else {
        reset({
          name: "",
          slug: "",
          state: "",
          country: "India",
          isActive: true,
        });
      }
    }
  }, [open, editingCity, reset]);

  const onSubmit = async (values: CityFormValues) => {
    try {
      if (mode === "edit") {
        const payload: any = {};
        if (dirtyFields.name) payload.name = values.name;
        if (dirtyFields.slug) payload.slug = values.slug;
        if (dirtyFields.state) payload.state = values.state;
        if (dirtyFields.country) payload.country = values.country;
        if (dirtyFields.isActive) payload.isActive = values.isActive;

        await onSave(payload);
        toast.success("City updated successfully");
      } else {
        await onSave(values);
        toast.success("City created successfully");
      }
      onOpenChange(false);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to save city";
      toast.error(errMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {mode === "edit" ? "Edit City" : "Add New City"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === "edit"
              ? "Update the city's name or active status."
              : "Register a new service city with geographic details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* City Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">City Name</label>
            <Input
              {...register("name")}
              placeholder="e.g. Ahmedabad, Mumbai"
              className="h-10 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-sm rounded-lg"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">Slug</label>
            <Input
              {...register("slug")}
              placeholder="e.g. ahmedabad"
              className="h-10 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-sm rounded-lg"
            />
            {errors.slug && (
              <p className="text-[11px] text-destructive font-medium">{errors.slug.message}</p>
            )}
          </div>

          {/* State & Country Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">State</label>
              <Input
                {...register("state")}
                placeholder="e.g. Gujarat"
                className="h-10 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-sm rounded-lg"
              />
              {errors.state && (
                <p className="text-[11px] text-destructive font-medium">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Country</label>
              <Input
                {...register("country")}
                placeholder="e.g. India"
                className="h-10 border-border/60 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] text-sm rounded-lg"
              />
              {errors.country && (
                <p className="text-[11px] text-destructive font-medium">{errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between border border-border/50 rounded-lg p-3 bg-muted/20">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">Active Status</span>
              <p className="text-[10px] text-muted-foreground">Enable or disable service for this city</p>
            </div>
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-4.5 w-4.5 rounded border-gray-300 text-[#2d7a4f] focus:ring-[#2d7a4f]/20 accent-[#2d7a4f] cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 text-xs font-semibold border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2d7a4f] hover:bg-[#236040] text-white h-10 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg"
            >
              {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
              {mode === "edit" ? "Save Changes" : "Add City"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
