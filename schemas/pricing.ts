import * as z from "zod";

// NOTE: Fields ending in "Paisa" are displayed to the user in ₹ (rupees).
// The form stores rupee values. Conversion to paisa happens on submit.
export const pricingConfigSchema = z.object({
  // These are stored in ₹ in the form (converted to paisa on submit)
  baseDeliveryChargePaisa: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative"),
  additionalChargePerKmPaisa: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative"),
  additionalChargePerKgPaisa: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative"),
  platformFeePaisa: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative"),
  defaultPlatformMarkupPct: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  defaultCommissionPct: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),

  // These stay as-is (no conversion)
  baseDistanceKm: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative"),
  includedWeightKg: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative"),
  maxDeliverableWeightKg: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative"),
  defaultItemWeightGrams: z
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .min(1, "Must be at least 1 gram"),
  gstPercentage: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  gstRateBps: z
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative"),

  // Slot & scheduling settings
  defaultSlotCutoffTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be a valid HH:MM time")
    .optional()
    .or(z.literal("")),
  minGapBetweenSlotsMinutes: z
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .optional()
    .or(z.null()),
  maxSlotTimeChangesPerMonth: z
    .number({ error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .optional()
    .or(z.null()),
  slotTimeChangePenaltyPaisa: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative")
    .optional()
    .or(z.null()),
});

export type PricingConfigFormValues = z.infer<typeof pricingConfigSchema>;

export const pricingRuleSchema = z
  .object({
    name: z
      .string()
      .min(1, "Rule Name is required")
      .min(2, "Rule Name must be at least 2 characters")
      .max(100),
    type: z.enum(["SURCHARGE", "DISCOUNT"]),
    priority: z
      .number({ error: "Priority is required" })
      .int("Priority must be a whole number")
      .min(0, "Priority cannot be negative"),
    isActive: z.boolean().default(true),
    validFrom: z.string().optional().or(z.null()).or(z.literal("")),
    validUntil: z.string().optional().or(z.null()).or(z.literal("")),
    target: z.enum(["PLATFORM_MARKUP", "SETTLEMENT_COMMISSION", "PLATFORM_FEE", "DELIVERY_FEE"]),
    percentageValue: z
      .number({ error: "Percentage value is required" })
      .min(0, "Percentage cannot be negative")
      .optional()
      .or(z.null()),
    flatAmount: z
      .number({ error: "Flat amount is required" })
      .min(0, "Amount cannot be negative")
      .optional()
      .or(z.null()),
    conditions: z
      .object({
        cityId: z.string().optional().or(z.null()),
        categoryId: z.string().optional().or(z.null()),
        chefId: z.string().optional().or(z.null()),
        productId: z.string().optional().or(z.null()),
        weather: z.string().optional().or(z.null()),
      })
      .refine(
        (conds) => {
          return !!(
            conds.cityId ||
            conds.categoryId ||
            conds.chefId ||
            conds.productId ||
            conds.weather
          );
        },
        {
          message: "At least one condition must be specified",
        }
      ),
  })
  .refine(
    (data) => {
      if (data.target === "PLATFORM_MARKUP" || data.target === "SETTLEMENT_COMMISSION") {
        return (
          data.percentageValue !== undefined &&
          data.percentageValue !== null &&
          !isNaN(data.percentageValue)
        );
      }
      return true;
    },
    {
      message: "Percentage value is required",
      path: ["percentageValue"],
    }
  )
  .refine(
    (data) => {
      if (data.target === "DELIVERY_FEE" || data.target === "PLATFORM_FEE") {
        return (
          data.flatAmount !== undefined &&
          data.flatAmount !== null &&
          !isNaN(data.flatAmount)
        );
      }
      return true;
    },
    {
      message: "Flat amount is required",
      path: ["flatAmount"],
    }
  );

export type PricingRuleFormValues = z.infer<typeof pricingRuleSchema>;
