import * as z from "zod";

export const promotionFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  displayType: z.enum(["COUPON", "LIST", "BANNER", "BANNER_AND_COUPON", "HIDDEN"]),
  promotionType: z.enum(["FREE_DELIVERY", "BOGO", "DISCOUNT", "PLATFORM"]),
  priority: z.number().min(0, "Priority must be at least 0"),
  isActive: z.boolean(),
  isStackable: z.boolean(),
  validFrom: z.string().min(1, "Valid from date is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  budgetCap: z.number().min(0, "Budget cap must be at least 0").nullable().optional(),
  maxRedemptions: z.number().min(1, "Max redemptions must be at least 1").nullable().optional(),
  maxPerUser: z.number().min(1, "Max per user must be at least 1").nullable().optional(),
  
  // Conditions
  minOrderValue: z.number().min(0, "Minimum order value must be at least 0").nullable().optional(),
  isFirstOrder: z.boolean(),
  productIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  chefIds: z.array(z.string()),
  
  // Target Conditions (for PLATFORM)
  targetCities: z.array(z.string()),
  targetCategories: z.array(z.string()),
  targetChefs: z.array(z.string()),
  targetSegments: z.array(z.string()),

  // Actions
  actionType: z.enum(["WAIVE_DELIVERY_FEE", "BOGO", "PERCENTAGE_CATEGORY", "FLAT_SUBTOTAL", "PERCENTAGE_SUBTOTAL"]),
  value: z.number().min(1, "Value must be at least 1").max(100, "Percentage value cannot exceed 100").nullable().optional(),
  valueRupees: z.number().min(1, "Discount value must be at least 1").nullable().optional(),
  maxDiscountRupees: z.number().min(1, "Max discount must be at least 1").nullable().optional(),
  buyQuantity: z.number().min(1, "Buy quantity must be at least 1").nullable().optional(),
  freeQuantity: z.number().min(1, "Free quantity must be at least 1").nullable().optional(),
  targetProductIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  // Validate Coupon Code requirement
  if ((data.displayType === "COUPON" || data.displayType === "BANNER_AND_COUPON") && (!data.code || data.code.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Coupon code is required when display type includes a COUPON",
      path: ["code"],
    });
  }

  // Validate Date range
  if (data.validFrom && data.validUntil) {
    const from = new Date(data.validFrom);
    const until = new Date(data.validUntil);
    if (until <= from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid until date must be after the valid from date",
        path: ["validUntil"],
      });
    }
  }

  // Validate action inputs depending on type
  if (data.promotionType === "FREE_DELIVERY") {
    if (data.actionType !== "WAIVE_DELIVERY_FEE") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action type must be WAIVE_DELIVERY_FEE for FREE_DELIVERY promotions",
        path: ["actionType"],
      });
    }
  }

  if (data.promotionType === "BOGO") {
    if (data.actionType !== "BOGO") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action type must be BOGO for BOGO promotions",
        path: ["actionType"],
      });
    }
    if (!data.buyQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Buy quantity is required for BOGO",
        path: ["buyQuantity"],
      });
    }
    if (!data.freeQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Free quantity is required for BOGO",
        path: ["freeQuantity"],
      });
    }
  }

  if (data.promotionType === "DISCOUNT" || data.promotionType === "PLATFORM") {
    if (!["PERCENTAGE_CATEGORY", "FLAT_SUBTOTAL", "PERCENTAGE_SUBTOTAL"].includes(data.actionType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action type must be a valid discount type (PERCENTAGE_CATEGORY, FLAT_SUBTOTAL, or PERCENTAGE_SUBTOTAL)",
        path: ["actionType"],
      });
    }

    if (data.actionType === "PERCENTAGE_SUBTOTAL" || data.actionType === "PERCENTAGE_CATEGORY") {
      if (data.value === null || data.value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percentage value is required",
          path: ["value"],
        });
      }
    }

    if (data.actionType === "FLAT_SUBTOTAL") {
      if (data.valueRupees === null || data.valueRupees === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Flat discount amount is required",
          path: ["valueRupees"],
        });
      }
    }

    if (data.actionType === "PERCENTAGE_CATEGORY") {
      if (data.categoryIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one category must be selected for category-specific discounts",
          path: ["categoryIds"],
        });
      }
    }
  }
});

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;
