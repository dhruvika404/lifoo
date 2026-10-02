"use client";

import { useMemo } from "react";
import {
  ShieldCheck,
  User,
  Check,
  Lock,
  Building2,
  Stamp,
} from "lucide-react";
import type { VerificationItem } from "./types";

interface DocumentPreviewVisualizerProps {
  docType: string;
  chef: VerificationItem;
}

export function DocumentPreviewVisualizer({
  docType,
  chef,
}: DocumentPreviewVisualizerProps) {
  const hashId = useMemo(() => {
    return Math.floor(100000000000 + Math.random() * 900000000000);
  }, []);

  switch (docType) {
    case "Aadhaar":
      return (
        <div className="w-full max-w-md border-2 border-amber-300/60 rounded-xl bg-[#FFFDF6] p-4 text-slate-800 shadow-sm relative overflow-hidden font-sans">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-center">
            <ShieldCheck className="h-36 w-36 mx-auto" />
          </div>

          <div className="flex items-center justify-between border-b border-red-500 pb-2 mb-3">
            <div className="text-[10px] leading-tight text-red-700 font-bold">
              भारत सरकार <br />
              GOVERNMENT OF INDIA
            </div>
            <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-[9px] leading-tight text-right text-emerald-800 font-bold font-mono">
              भारतीय विशिष्ट पहचान प्राधिकरण <br />
              UIDAI
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-24 h-28 border border-slate-300 rounded-sm bg-slate-200/50 flex flex-col items-center justify-center p-1 shrink-0">
              <div className="w-full h-full bg-slate-300 rounded-xs flex items-center justify-center">
                <User className="h-12 w-12 text-slate-500" />
              </div>
              <div className="text-[7px] text-slate-500 font-bold mt-1 tracking-widest">
                VERIFIED
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between text-xs space-y-1.5 py-0.5">
              <div>
                <span className="text-[9px] text-slate-500 block">नाम / Name</span>
                <span className="font-bold text-slate-900">{chef.owner}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">जन्म तिथि / DOB</span>
                <span className="font-semibold text-slate-800">12/04/1991</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">लिंग / Gender</span>
                <span className="font-semibold text-slate-800">Female / महिला</span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-red-500 pt-2 text-center">
            <div className="text-lg font-bold tracking-widest text-slate-900 font-mono">
              {String(hashId).slice(0, 4)} {String(hashId).slice(4, 8)}{" "}
              {String(hashId).slice(8, 12)}
            </div>
            <div className="text-[9px] text-red-700 font-bold mt-0.5">
              मेरा आधार, मेरी पहचान
            </div>
          </div>
        </div>
      );

    case "PAN":
      return (
        <div className="w-full max-w-md border border-cyan-800 rounded-xl bg-gradient-to-br from-cyan-900 via-cyan-950 to-slate-900 text-slate-100 p-5 shadow-lg relative overflow-hidden font-sans">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-radial-gradient"></div>

          <div className="flex items-center justify-between border-b border-cyan-700/50 pb-2 mb-3">
            <div>
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                INCOME TAX DEPARTMENT
              </div>
              <div className="text-[8px] text-slate-400 font-medium">GOVT. OF INDIA</div>
            </div>
            <div className="h-6 w-6 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Stamp className="h-3.5 w-3.5 text-cyan-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="col-span-2 space-y-2">
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">Name</span>
                <span className="font-bold text-white tracking-wide uppercase">
                  {chef.owner}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 uppercase block">
                  Father&apos;s Name
                </span>
                <span className="font-semibold text-slate-200 uppercase">
                  R. K. {chef.owner.split(" ")[1] || "SHARMA"}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 uppercase block">Date of Birth</span>
                <span className="font-mono text-slate-200">12/04/1991</span>
              </div>
            </div>

            <div className="col-span-1 flex flex-col items-center justify-between border-l border-cyan-800/60 pl-3">
              <div className="w-16 h-20 border border-cyan-700/50 bg-slate-800/80 rounded flex items-center justify-center">
                <User className="h-10 w-10 text-cyan-500/60" />
              </div>
              <div className="text-[8px] text-cyan-400 font-mono mt-1 text-center">
                PERMANENT ACCOUNT NUMBER
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-cyan-700/50 flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
              ABCDE{String(hashId).slice(0, 4)}F
            </span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase border border-cyan-600/40 px-1.5 py-0.5 rounded">
              INDIVIDUAL
            </span>
          </div>
        </div>
      );

    case "FSSAI License":
    case "FSSAI":
      return (
        <div className="w-full max-w-md border-2 border-emerald-600/40 rounded-xl bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-slate-100 p-5 shadow-lg relative overflow-hidden font-sans">
          <div className="flex items-start justify-between border-b border-emerald-500/30 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400 tracking-wider">
                  FSSAI LICENSE CERTIFICATE
                </div>
                <div className="text-[9px] text-slate-400">
                  Food Safety and Standards Authority of India
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full uppercase">
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">
                  Establishment / Kitchen
                </span>
                <span className="font-semibold text-emerald-300 truncate block">
                  {chef.name}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">License No.</span>
                <span className="font-mono font-bold text-white text-xs">
                  115{String(hashId).slice(0, 11)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">License Type</span>
                <span className="font-medium text-slate-200 text-[11px]">
                  State Food License (Category: Food Services)
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">Valid Until</span>
                <span className="font-semibold text-emerald-400 text-[11px]">
                  31 Dec 2027
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[9px] text-slate-400 uppercase block">
                Registered Address
              </span>
              <span className="text-[11px] text-slate-300 block leading-tight">
                Plot 42, Sector 18, Industrial Area, Mumbai, Maharashtra - 400705
              </span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[9px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="h-3 w-3" /> Digitally Signed & Verified
            </span>
            <span>Ref ID: FSSAI-2026-X892</span>
          </div>
        </div>
      );

    case "Bank Statement / Cancelled Cheque":
    case "Bank":
      return (
        <div className="w-full max-w-md border border-slate-700 rounded-xl bg-card text-foreground p-5 shadow-sm relative overflow-hidden font-sans">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-foreground">
                  HDFC BANK LIMITED
                </div>
                <div className="text-[9px] text-muted-foreground">CANCELLED CHEQUE PROOF</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
              IFSC: HDFC0001234
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-[10px] uppercase">
                  Account Holder Name
                </span>
                <span className="font-bold text-foreground">{chef.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-[10px] uppercase">
                  Account Number
                </span>
                <span className="font-mono font-bold text-foreground">
                  5010023948{String(hashId).slice(0, 4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-[10px] uppercase">
                  Branch Location
                </span>
                <span className="font-medium text-foreground">Bandra West Branch, Mumbai</span>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-red-400/60 rounded-lg p-3 text-center bg-red-500/5">
              <div className="text-xl font-black text-red-600/40 uppercase tracking-widest select-none transform -rotate-6">
                CANCELLED
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">
                Account ownership verified for direct payout settlements.
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full max-w-md border border-border rounded-xl bg-card p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{docType} Document</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Encrypted verification file uploaded by {chef.name}.
            </p>
          </div>
        </div>
      );
  }
}
