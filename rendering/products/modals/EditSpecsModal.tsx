"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { TagInput } from "@/components/ui/tag-input";
import { productService } from "@/services/product.service";
import { cuisineService } from "@/services/cuisine.service";
import { dietaryTypeService } from "@/services/dietary-type.service";

type Props = {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function EditSpecsModal({ product, open, onOpenChange, onUpdated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCuisines, setAllCuisines] = useState<any[]>([]);
  const [allDietaryTypes, setAllDietaryTypes] = useState<any[]>([]);
  const [selectedCuisineIds, setSelectedCuisineIds] = useState<string[]>([]);
  const [selectedDietaryTypeIds, setSelectedDietaryTypeIds] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);

  useEffect(() => {
    cuisineService.getCuisines({ limit: 100 }).then((res) => {
      const items = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
      setAllCuisines(items);
    }).catch(() => { });
    dietaryTypeService.getDietaryTypes({ limit: 100 }).then((res) => {
      const items = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
      setAllDietaryTypes(items);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (open && product) {
      setSelectedCuisineIds(product.cuisines?.map((c: any) => c.cuisineId ?? c.id) ?? []);
      setSelectedDietaryTypeIds(product.dietaryTypes?.map((d: any) => d.dietaryTypeId ?? d.id) ?? []);
      setIngredients(product.ingredients ?? []);
      setAllergens(product.allergens ?? []);
    }
  }, [open, product]);

  const toggleCuisine = (id: string) => {
    setSelectedCuisineIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleDietaryType = (id: string) => {
    setSelectedDietaryTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await productService.updateProduct(product.id, {
        cuisineIds: selectedCuisineIds,
        dietaryTypeIds: selectedDietaryTypeIds,
        ingredients,
        allergens,
      });
      toast.success("Specifications updated successfully.");
      onUpdated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update specifications");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Specifications</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Cuisines</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border/60 bg-muted/10">
              {allCuisines.map((c: any) => {
                const selected = selectedCuisineIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCuisine(c.id)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${selected
                        ? "bg-[#2d7a4f] text-white border-[#2d7a4f]"
                        : "bg-background text-foreground/80 border-border/50 hover:border-[#2d7a4f]/50 hover:bg-[#2d7a4f]/5"
                      }`}
                  >
                    {c.name}
                  </button>
                );
              })}
              {allCuisines.length === 0 && (
                <span className="text-xs text-muted-foreground italic">Loading cuisines…</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Dietary Types</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border/60 bg-muted/10">
              {allDietaryTypes.map((d: any) => {
                const selected = selectedDietaryTypeIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDietaryType(d.id)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${selected
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-background text-foreground/80 border-border/50 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                      }`}
                  >
                    {d.name}
                  </button>
                );
              })}
              {allDietaryTypes.length === 0 && (
                <span className="text-xs text-muted-foreground italic">Loading dietary types…</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Ingredients</label>
            <TagInput
              value={ingredients}
              onChange={setIngredients}
              placeholder="Add ingredient..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Allergens</label>
            <TagInput
              value={allergens}
              onChange={setAllergens}
              placeholder="Add allergen..."
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
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
