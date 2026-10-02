import * as z from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Forgot Password Stage 1 Schema
export const forgotPasswordRequestSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
});

export type ForgotPasswordRequestFormValues = z.infer<typeof forgotPasswordRequestSchema>;

// Forgot Password Stage 2 Schema
export const forgotPasswordResetSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  otp: z.string().min(1, "Verification code is required"),
  password: z.string().min(1, "New password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ForgotPasswordResetFormValues = z.infer<typeof forgotPasswordResetSchema>;

// Reset Password Stage 1 Schema
export const resetPasswordRequestSchema = z.object({
  phone: z.string()
    .min(1, "Phone number is required")
    .refine((val) => /^\+?[0-9\s\-]{8,15}$/.test(val.trim()), {
      message: "Please enter a valid phone number",
    }),
});

export type ResetPasswordRequestFormValues = z.infer<typeof resetPasswordRequestSchema>;

// Reset Password Stage 2 Schema
export const resetPasswordConfirmSchema = z.object({
  phone: z.string()
    .min(1, "Phone number is required")
    .refine((val) => /^\+?[0-9\s\-]{8,15}$/.test(val.trim()), {
      message: "Please enter a valid phone number",
    }),
  otp: z.string().min(1, "OTP code is required"),
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(1, "New password is required").min(6, "New password must be at least 6 characters"),
});

export type ResetPasswordConfirmFormValues = z.infer<typeof resetPasswordConfirmSchema>;
