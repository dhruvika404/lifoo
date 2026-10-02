import * as z from "zod";

export const addAdminSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  emailPrefix: z.string()
    .min(1, "Email is required")
    .refine((val) => val.includes("@"), {
      message: "Email must contain username and domain (e.g. user@gmail)",
    })
    .refine((val) => {
      let email = val.trim();
      if (!email.endsWith(".com")) {
        email += ".com";
      }
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, {
      message: "Invalid email format",
    }),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  roleType: z.enum(["default", "custom"]),
  defaultRole: z.string(),
});

export type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export const addRoleSchema = z.object({
  name: z.string()
    .min(2, "Role name must be at least 2 characters")
    .regex(/^[a-z0-9_]+$/, "Role name must contain only lowercase letters, numbers, and underscores (e.g. customer_support)"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  permissions: z.array(
    z.object({
      module: z.string(),
      create: z.boolean(),
      read: z.boolean(),
      update: z.boolean(),
      delete: z.boolean(),
    })
  ).min(1, "At least one module permission must be defined"),
});

export type AddRoleFormValues = z.infer<typeof addRoleSchema>;
