"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, LoginFormValues } from "@/schemas";

export function LoginModule() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setGeneralError("");

    try {
      await login(values.email, values.password);
      setIsSuccess(true);
      await new Promise((r) => setTimeout(r, 600));
      router.push("/dashboard");
    } catch (err: any) {
      const displayMsg = err.response?.data?.message || err.message || "Authentication failed. Please verify your credentials.";
      setGeneralError(displayMsg);
      toast.error(displayMsg);
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
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground/80 max-w-[280px]">
                Sign in to your LiFoo Admin Portal to manage delivery logistics
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {generalError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                  <span className="font-medium">{generalError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <Input
                    type="email"
                    placeholder="admin@lifoo.com"
                    autoComplete="email"
                    disabled={isLoading || isSuccess}
                    className={`pl-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                      errors.email ? "border-destructive/60 focus-visible:ring-destructive" : ""
                    }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                    <span className="text-xs text-muted-foreground/30">|</span>
                    <Link
                      href="/reset-password"
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Reset password
                    </Link>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground/80 group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading || isSuccess}
                    className={`pl-10 pr-10 h-11 bg-background/50 border-input/60 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 ${
                      errors.password ? "border-destructive/60 focus-visible:ring-destructive" : ""
                    }`}
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSuccess}
                    className="absolute inset-y-0 right-0 flex items-center justify-center text-muted-foreground/75 hover:text-foreground hover:bg-transparent cursor-pointer focus-visible:ring-0 transition-colors duration-200 disabled:opacity-50 h-full w-10"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs font-semibold text-destructive pl-1 animate-slide-down">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 pl-1 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  disabled={isLoading || isSuccess}
                  className="h-4 w-4 rounded-sm border-input text-primary focus:ring-primary accent-primary cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="remember"
                  className="text-xs font-semibold text-muted-foreground/90 cursor-pointer select-none"
                >
                  Keep me signed in on this device
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/15 transition-all duration-250 cursor-pointer active:scale-[0.98] ${
                  isSuccess
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-600/10"
                    : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                    Signing in...
                  </span>
                ) : isSuccess ? (
                  "Success! Redirecting..."
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
