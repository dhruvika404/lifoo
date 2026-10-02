"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Lock, Eye, EyeOff, Key } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
  ForgotPasswordRequestFormValues,
  ForgotPasswordResetFormValues,
} from "@/schemas";

export function ForgotPasswordModule() {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const forgotPasswordOtp = useAuthStore((state) => state.forgotPasswordOtp);
  const forgotPasswordReset = useAuthStore((state) => state.forgotPasswordReset);
  const isLoading = useAuthStore((state) => state.isLoading);

  const requestForm = useForm<ForgotPasswordRequestFormValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ForgotPasswordResetFormValues>({
    resolver: zodResolver(forgotPasswordResetSchema),
    defaultValues: { email: "", otp: "", password: "", confirmPassword: "" },
  });

  const handleRequestSubmit = async (values: ForgotPasswordRequestFormValues) => {
    setGeneralError("");
    try {
      await forgotPasswordOtp(values.email);
      resetForm.setValue("email", values.email);
      setIsOtpSent(true);
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || err.message || "Failed to process request. Please try again later.");
    }
  };

  const handleResetSubmit = async (values: ForgotPasswordResetFormValues) => {
    setGeneralError("");
    try {
      await forgotPasswordReset(values.email, values.otp, values.password);
      setIsResetSuccess(true);
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || err.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-radial from-primary/10 via-background to-background overflow-hidden selection:bg-primary/20 select-none">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-primary/8 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-primary/4 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />

      <div className="w-full max-w-[420px] z-10 transition-all duration-500 scale-95 md:scale-100">
        <Card className="border-border/60 bg-card/75 backdrop-blur-xl shadow-2xl rounded-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="space-y-4 pb-6 pt-8 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-xl shadow-primary/25 ring-4 ring-primary/10 hover:rotate-12 transition-transform duration-300 select-none">
              L
            </div>

            {!isOtpSent ? (
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
                  Forgot password
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground/80 max-w-[280px]">
                  Enter your email address and we'll send you an OTP code to reset your password.
                </CardDescription>
              </div>
            ) : !isResetSuccess ? (
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
                  Set new password
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground/80 max-w-[280px]">
                  Enter the OTP code sent to your email and set your new password.
                </CardDescription>
              </div>
            ) : (
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
                  Password updated
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground/80 max-w-[280px]">
                  Your password has been successfully updated.
                </CardDescription>
              </div>
            )}
          </CardHeader>

          <CardContent className="pb-8 px-8 animate-fade-in">
            {!isOtpSent ? (
              <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-5">
                {generalError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-destructive mt-0.5" />
                    <span className="font-medium">{generalError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                    </div>
                    <Input
                      type="email"
                      placeholder="admin@lifoo.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className={`pl-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                        requestForm.formState.errors.email ? "border-destructive/60 focus-visible:ring-destructive" : ""
                      }`}
                      {...requestForm.register("email")}
                    />
                  </div>
                  {requestForm.formState.errors.email && (
                    <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/15 transition-all duration-250 cursor-pointer active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                      Sending OTP...
                    </span>
                  ) : (
                    "Send OTP Code"
                  )}
                </Button>

                <div className="flex justify-center pt-2">
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            ) : !isResetSuccess ? (
              <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-5">
                {generalError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-shake">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-destructive mt-0.5" />
                    <span className="font-medium">{generalError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                    </div>
                    <Input
                      type="email"
                      placeholder="admin@lifoo.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className={`pl-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                        resetForm.formState.errors.email ? "border-destructive/60 focus-visible:ring-destructive" : ""
                      }`}
                      {...resetForm.register("email")}
                    />
                  </div>
                  {resetForm.formState.errors.email && (
                    <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                      {resetForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                    Verification Code (OTP)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Key className="h-4.5 w-4.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter OTP code"
                      disabled={isLoading}
                      className={`pl-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                        resetForm.formState.errors.otp ? "border-destructive/60 focus-visible:ring-destructive" : ""
                      }`}
                      {...resetForm.register("otp")}
                    />
                  </div>
                  {resetForm.formState.errors.otp && (
                    <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                      {resetForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                        resetForm.formState.errors.password ? "border-destructive/60 focus-visible:ring-destructive" : ""
                      }`}
                      {...resetForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-transparent cursor-pointer focus-visible:ring-0 transition-colors duration-200 disabled:opacity-50 h-full w-10"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </Button>
                  </div>
                  {resetForm.formState.errors.password && (
                    <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={`pl-10 pr-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                        resetForm.formState.errors.confirmPassword ? "border-destructive/60 focus-visible:ring-destructive" : ""
                      }`}
                      {...resetForm.register("confirmPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-transparent cursor-pointer focus-visible:ring-0 transition-colors duration-200 disabled:opacity-50 h-full w-10"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </Button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/15 transition-all duration-250 cursor-pointer active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-primary-foreground" />
                      Resetting password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setIsOtpSent(false);
                      setGeneralError("");
                    }}
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer h-auto p-0 no-underline hover:no-underline"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    Back to Request Link
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/5 ring-4 ring-emerald-500/5 animate-scale-up select-none">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <div className="text-center text-xs text-muted-foreground/80 space-y-1 max-w-[280px]">
                  <p>Your password has been successfully updated. You can now use your new password to sign in.</p>
                </div>

                <Button
                  asChild
                  className="w-full h-11 rounded-xl font-semibold shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10 cursor-pointer"
                >
                  <Link href="/login">
                    Proceed to Sign In
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
