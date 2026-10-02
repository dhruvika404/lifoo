"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Phone, Key, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
  ResetPasswordRequestFormValues,
  ResetPasswordConfirmFormValues,
} from "@/schemas";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";

  const [stage, setStage] = useState<1 | 2>(1);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const requestPhoneOtp = useAuthStore((state) => state.requestPhoneOtp);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const isLoading = useAuthStore((state) => state.isLoading);

  const requestForm = useForm<ResetPasswordRequestFormValues>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { phone: phoneParam },
  });

  const confirmForm = useForm<ResetPasswordConfirmFormValues>({
    resolver: zodResolver(resetPasswordConfirmSchema),
    defaultValues: { phone: phoneParam, otp: "", oldPassword: "", newPassword: "" },
  });

  useEffect(() => {
    if (phoneParam) {
      requestForm.setValue("phone", phoneParam);
      confirmForm.setValue("phone", phoneParam);
    }
  }, [phoneParam, requestForm, confirmForm]);

  const handleStage1Submit = async (values: ResetPasswordRequestFormValues) => {
    setGeneralError("");
    try {
      await requestPhoneOtp(values.phone.trim(), "sensitive_action");
      confirmForm.setValue("phone", values.phone.trim());
      setStage(2);
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || err.message || "Failed to process request. Please try again.");
    }
  };

  const handleStage2Submit = async (values: ResetPasswordConfirmFormValues) => {
    setGeneralError("");
    try {
      await resetPassword(
        values.phone.trim(),
        "sensitive_action",
        values.otp.trim(),
        values.oldPassword,
        values.newPassword
      );
      setIsSuccess(true);
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || err.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <>
      <CardHeader className="space-y-4 pb-6 pt-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-xl shadow-primary/25 ring-4 ring-primary/10 hover:rotate-12 transition-transform duration-300 select-none">
          L
        </div>

        {!isSuccess ? (
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
              {stage === 1 ? "Reset password" : "Verify & update"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80 max-w-[300px]">
              {stage === 1 
                ? "Enter your phone number to request an OTP code."
                : "Enter your verification code, old password, and new password."
              }
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
        {!isSuccess ? (
          stage === 1 ? (
            <form onSubmit={requestForm.handleSubmit(handleStage1Submit)} className="space-y-5">
              {generalError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-shake">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-destructive mt-0.5" />
                  <span className="font-medium">{generalError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4.5 w-4.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    disabled={isLoading}
                    className={`pl-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                      requestForm.formState.errors.phone ? "border-destructive/60 focus-visible:ring-destructive" : ""
                    }`}
                    {...requestForm.register("phone")}
                  />
                </div>
                {requestForm.formState.errors.phone && (
                  <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                    {requestForm.formState.errors.phone.message}
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
                  "Request Verification Code"
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
          ) : (
            <form onSubmit={confirmForm.handleSubmit(handleStage2Submit)} className="space-y-5">
              {generalError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-shake">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-destructive mt-0.5" />
                  <span className="font-medium">{generalError}</span>
                </div>
              )}

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
                    placeholder="Enter the code sent to your phone"
                    disabled={isLoading}
                    className={`pl-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                      confirmForm.formState.errors.otp ? "border-destructive/60 focus-visible:ring-destructive" : ""
                    }`}
                    {...confirmForm.register("otp")}
                  />
                </div>
                {confirmForm.formState.errors.otp && (
                  <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                    {confirmForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                  Old Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                      confirmForm.formState.errors.oldPassword ? "border-destructive/60 focus-visible:ring-destructive" : ""
                    }`}
                    {...confirmForm.register("oldPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-transparent cursor-pointer focus-visible:ring-0 transition-colors duration-200 disabled:opacity-50 h-full w-10"
                  >
                    {showOldPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </Button>
                </div>
                {confirmForm.formState.errors.oldPassword && (
                  <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                    {confirmForm.formState.errors.oldPassword.message}
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
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                      confirmForm.formState.errors.newPassword ? "border-destructive/60 focus-visible:ring-destructive" : ""
                    }`}
                    {...confirmForm.register("newPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-transparent cursor-pointer focus-visible:ring-0 transition-colors duration-200 disabled:opacity-50 h-full w-10"
                  >
                    {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </Button>
                </div>
                {confirmForm.formState.errors.newPassword && (
                  <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                    {confirmForm.formState.errors.newPassword.message}
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
                    setStage(1);
                    setGeneralError("");
                  }}
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer h-auto p-0 no-underline hover:no-underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                  Back to Request Form
                </Button>
              </div>
            </form>
          )
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
    </>
  );
}

export function ResetPasswordModule() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-radial from-primary/10 via-background to-background overflow-hidden selection:bg-primary/20 select-none">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-primary/8 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-primary/4 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />

      <div className="w-full max-w-[420px] z-10 transition-all duration-500 scale-95 md:scale-100">
        <Card className="border-border/60 bg-card/75 backdrop-blur-xl shadow-2xl rounded-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
          <Suspense fallback={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
