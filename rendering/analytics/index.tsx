"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  RotateCcw,
  Users,
  ChefHat,
  BarChart3,
  MapPin,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { PageHeader, PageBody } from "@/components/pageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "month" | "quarter" | "year";

interface PeriodData {
  stats: { mtdRevenue: string; ytdRevenue: string; ordersMtd: number; repeatRate: number };
  statTrends: { mtdRevenue: string; ytdRevenue: string; ordersMtd: string; repeatRate: string; mtdUp: boolean; ytdUp: boolean; ordersUp: boolean; rateUp: boolean };
  categories: { name: string; pct: number; orders: number; highlight?: boolean }[];
  cities: { name: string; orders: number; link?: boolean }[];
  revenueBars: { label: string; amount: number; pct: number }[];
  chefs: { name: string; city: string; orders: number; revenue: string; rating: number; badge: string | null }[];
  keyMetrics: { metric: string; value: string; change: string; up: boolean }[];
  acquisition: { label: string; pct: number; color: string }[];
  refunds: { label: string; value: string; sub: string }[];
}

// ─── Static Data by Period ───────────────────────────────────────────────────

const periodData: Record<Period, PeriodData> = {
  month: {
    stats: { mtdRevenue: "₹38.7L", ytdRevenue: "₹2.14Cr", ordersMtd: 9420, repeatRate: 62 },
    statTrends: { mtdRevenue: "+14.2%", ytdRevenue: "+22.8%", ordersMtd: "+8.5%", repeatRate: "-1.3%", mtdUp: true, ytdUp: true, ordersUp: true, rateUp: false },
    categories: [
      { name: "Sweets", pct: 82, orders: 7724 },
      { name: "Snacks & Bakery", pct: 68, orders: 6406 },
      { name: "Farsan", pct: 54, orders: 5087 },
      { name: "Dairy", pct: 40, orders: 3768, highlight: true },
      { name: "Masalas", pct: 32, orders: 3014 },
      { name: "Pickles", pct: 24, orders: 2261 },
    ],
    cities: [
      { name: "Mumbai", orders: 2840, link: true },
      { name: "Bengaluru", orders: 2120, link: true },
      { name: "Delhi", orders: 1980, link: true },
      { name: "Pune", orders: 1340 },
      { name: "Hyderabad", orders: 980, link: true },
    ],
    revenueBars: [
      { label: "Aug 13", amount: 204000, pct: 42 },
      { label: "Aug 14", amount: 268000, pct: 55 },
      { label: "Aug 15", amount: 185000, pct: 38 },
      { label: "Aug 16", amount: 326000, pct: 67 },
      { label: "Aug 17", amount: 350000, pct: 72 },
      { label: "Aug 18", amount: 282000, pct: 58 },
      { label: "Aug 19", amount: 389000, pct: 80 },
      { label: "Aug 20", amount: 306000, pct: 63 },
      { label: "Aug 21", amount: 360000, pct: 74 },
      { label: "Aug 22", amount: 428000, pct: 88 },
      { label: "Aug 23", amount: 370000, pct: 76 },
      { label: "Aug 24", amount: 447000, pct: 92 },
      { label: "Aug 25", amount: 413000, pct: 85 },
      { label: "Aug 26", amount: 467000, pct: 96 },
    ],
    chefs: [
      { name: "Rekha Mehta", city: "Mumbai", orders: 312, revenue: "₹1.42L", rating: 4.9, badge: "Top Chef" },
      { name: "Sunita Sharma", city: "Delhi", orders: 287, revenue: "₹1.18L", rating: 4.8, badge: "Rising" },
      { name: "Priya Patel", city: "Bengaluru", orders: 264, revenue: "₹1.05L", rating: 4.7, badge: null },
      { name: "Kavita Joshi", city: "Pune", orders: 241, revenue: "₹0.97L", rating: 4.7, badge: null },
      { name: "Anita Reddy", city: "Hyderabad", orders: 198, revenue: "₹0.81L", rating: 4.6, badge: null },
    ],
    keyMetrics: [
      { metric: "Avg Order Value", value: "₹486", change: "+₹24", up: true },
      { metric: "Cancellation Rate", value: "3.2%", change: "-0.4%", up: true },
      { metric: "Avg Delivery Time", value: "34 min", change: "-2 min", up: true },
      { metric: "New Customers", value: "1,240", change: "+180", up: true },
      { metric: "Chef Utilisation", value: "74%", change: "+3%", up: true },
      { metric: "Refund Rate", value: "1.8%", change: "+0.2%", up: false },
    ],
    acquisition: [
      { label: "Organic / Word of Mouth", pct: 48, color: "bg-primary" },
      { label: "Referral Programme", pct: 28, color: "bg-emerald-400" },
      { label: "Paid Ads", pct: 14, color: "bg-amber-400" },
      { label: "Social Media", pct: 10, color: "bg-blue-400" },
    ],
    refunds: [
      { label: "Total Refunds MTD", value: "₹38,400", sub: "81 orders" },
      { label: "Pending Disputes", value: "14", sub: "₹12,200 value" },
      { label: "Avg Resolution", value: "2.4 days", sub: "Target: 2 days" },
      { label: "Resolution Rate", value: "96.2%", sub: "+1.4% vs last month" },
    ],
  },
  quarter: {
    stats: { mtdRevenue: "₹1.09Cr", ytdRevenue: "₹2.14Cr", ordersMtd: 28460, repeatRate: 65 },
    statTrends: { mtdRevenue: "+18.6%", ytdRevenue: "+22.8%", ordersMtd: "+12.1%", repeatRate: "+2.1%", mtdUp: true, ytdUp: true, ordersUp: true, rateUp: true },
    categories: [
      { name: "Sweets", pct: 78, orders: 22200 },
      { name: "Snacks & Bakery", pct: 64, orders: 18220 },
      { name: "Farsan", pct: 58, orders: 16510 },
      { name: "Dairy", pct: 45, orders: 12810, highlight: true },
      { name: "Masalas", pct: 36, orders: 10250 },
      { name: "Pickles", pct: 21, orders: 5980 },
    ],
    cities: [
      { name: "Mumbai", orders: 8420, link: true },
      { name: "Bengaluru", orders: 6340, link: true },
      { name: "Delhi", orders: 5870, link: true },
      { name: "Pune", orders: 4120 },
      { name: "Hyderabad", orders: 3710, link: true },
    ],
    revenueBars: [
      { label: "Wk 1 Jun", amount: 2420000, pct: 55 },
      { label: "Wk 2 Jun", amount: 2640000, pct: 60 },
      { label: "Wk 3 Jun", amount: 2110000, pct: 48 },
      { label: "Wk 4 Jun", amount: 3170000, pct: 72 },
      { label: "Wk 1 Jul", amount: 2860000, pct: 65 },
      { label: "Wk 2 Jul", amount: 3430000, pct: 78 },
      { label: "Wk 3 Jul", amount: 3610000, pct: 82 },
      { label: "Wk 4 Jul", amount: 3080000, pct: 70 },
      { label: "Wk 1 Aug", amount: 3740000, pct: 85 },
      { label: "Wk 2 Aug", amount: 4010000, pct: 91 },
      { label: "Wk 3 Aug", amount: 3520000, pct: 80 },
      { label: "Wk 4 Aug", amount: 4180000, pct: 95 },
      { label: "Wk 5 Aug", amount: 3870000, pct: 88 },
      { label: "Aug 26", amount: 4400000, pct: 100 },
    ],
    chefs: [
      { name: "Rekha Mehta", city: "Mumbai", orders: 924, revenue: "₹4.18L", rating: 4.9, badge: "Top Chef" },
      { name: "Sunita Sharma", city: "Delhi", orders: 847, revenue: "₹3.52L", rating: 4.8, badge: "Rising" },
      { name: "Priya Patel", city: "Bengaluru", orders: 780, revenue: "₹3.12L", rating: 4.8, badge: null },
      { name: "Kavita Joshi", city: "Pune", orders: 712, revenue: "₹2.88L", rating: 4.7, badge: null },
      { name: "Anita Reddy", city: "Hyderabad", orders: 587, revenue: "₹2.40L", rating: 4.7, badge: null },
    ],
    keyMetrics: [
      { metric: "Avg Order Value", value: "₹512", change: "+₹50", up: true },
      { metric: "Cancellation Rate", value: "2.9%", change: "-0.7%", up: true },
      { metric: "Avg Delivery Time", value: "33 min", change: "-3 min", up: true },
      { metric: "New Customers", value: "3,820", change: "+640", up: true },
      { metric: "Chef Utilisation", value: "78%", change: "+7%", up: true },
      { metric: "Refund Rate", value: "1.6%", change: "-0.2%", up: true },
    ],
    acquisition: [
      { label: "Organic / Word of Mouth", pct: 44, color: "bg-primary" },
      { label: "Referral Programme", pct: 32, color: "bg-emerald-400" },
      { label: "Paid Ads", pct: 16, color: "bg-amber-400" },
      { label: "Social Media", pct: 8, color: "bg-blue-400" },
    ],
    refunds: [
      { label: "Total Refunds QTD", value: "₹1.12L", sub: "238 orders" },
      { label: "Pending Disputes", value: "32", sub: "₹38,400 value" },
      { label: "Avg Resolution", value: "2.2 days", sub: "Target: 2 days" },
      { label: "Resolution Rate", value: "97.4%", sub: "+2.6% vs last Qtr" },
    ],
  },
  year: {
    stats: { mtdRevenue: "₹2.14Cr", ytdRevenue: "₹2.14Cr", ordersMtd: 98400, repeatRate: 68 },
    statTrends: { mtdRevenue: "+22.8%", ytdRevenue: "+22.8%", ordersMtd: "+19.2%", repeatRate: "+5.4%", mtdUp: true, ytdUp: true, ordersUp: true, rateUp: true },
    categories: [
      { name: "Sweets", pct: 76, orders: 74800 },
      { name: "Snacks & Bakery", pct: 62, orders: 61000 },
      { name: "Farsan", pct: 55, orders: 54100 },
      { name: "Dairy", pct: 48, orders: 47200, highlight: true },
      { name: "Masalas", pct: 38, orders: 37400 },
      { name: "Pickles", pct: 28, orders: 27600 },
    ],
    cities: [
      { name: "Mumbai", orders: 28400, link: true },
      { name: "Bengaluru", orders: 21200, link: true },
      { name: "Delhi", orders: 19800, link: true },
      { name: "Pune", orders: 14200 },
      { name: "Hyderabad", orders: 11800, link: true },
    ],
    revenueBars: [
      { label: "Jan", amount: 9200000, pct: 38 },
      { label: "Feb", amount: 10900000, pct: 45 },
      { label: "Mar", amount: 12600000, pct: 52 },
      { label: "Apr", amount: 14550000, pct: 60 },
      { label: "May", amount: 13340000, pct: 55 },
      { label: "Jun", amount: 16980000, pct: 70 },
      { label: "Jul", amount: 15760000, pct: 65 },
      { label: "Aug 1", amount: 19400000, pct: 80 },
      { label: "Aug 2", amount: 18200000, pct: 75 },
      { label: "Aug 3", amount: 21340000, pct: 88 },
      { label: "Aug 4", amount: 20380000, pct: 84 },
      { label: "Aug 5", amount: 22320000, pct: 92 },
      { label: "Aug 6", amount: 23280000, pct: 96 },
      { label: "Aug 7", amount: 24260000, pct: 100 },
    ],
    chefs: [
      { name: "Rekha Mehta", city: "Mumbai", orders: 3841, revenue: "₹17.4L", rating: 4.9, badge: "Top Chef" },
      { name: "Sunita Sharma", city: "Delhi", orders: 3420, revenue: "₹14.2L", rating: 4.8, badge: "Rising" },
      { name: "Priya Patel", city: "Bengaluru", orders: 3180, revenue: "₹12.7L", rating: 4.8, badge: null },
      { name: "Kavita Joshi", city: "Pune", orders: 2940, revenue: "₹11.8L", rating: 4.7, badge: null },
      { name: "Anita Reddy", city: "Hyderabad", orders: 2420, revenue: "₹9.8L", rating: 4.7, badge: null },
    ],
    keyMetrics: [
      { metric: "Avg Order Value", value: "₹524", change: "+₹62", up: true },
      { metric: "Cancellation Rate", value: "2.7%", change: "-0.9%", up: true },
      { metric: "Avg Delivery Time", value: "32 min", change: "-4 min", up: true },
      { metric: "New Customers", value: "14,280", change: "+3,120", up: true },
      { metric: "Chef Utilisation", value: "81%", change: "+10%", up: true },
      { metric: "Refund Rate", value: "1.5%", change: "-0.3%", up: true },
    ],
    acquisition: [
      { label: "Organic / Word of Mouth", pct: 42, color: "bg-primary" },
      { label: "Referral Programme", pct: 34, color: "bg-emerald-400" },
      { label: "Paid Ads", pct: 15, color: "bg-amber-400" },
      { label: "Social Media", pct: 9, color: "bg-blue-400" },
    ],
    refunds: [
      { label: "Total Refunds YTD", value: "₹3.84L", sub: "812 orders" },
      { label: "Pending Disputes", value: "8", sub: "₹9,600 value" },
      { label: "Avg Resolution", value: "2.1 days", sub: "Target: 2 days" },
      { label: "Resolution Rate", value: "98.1%", sub: "+3.3% vs last year" },
    ],
  },
};

// ─── Export Helpers ───────────────────────────────────────────────────────────

function formatAmount(amt: number): string {
  if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)}Cr`;
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)}L`;
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(1)}K`;
  return `₹${amt.toLocaleString("en-IN")}`;
}

function buildExportRows(data: PeriodData, period: Period) {
  const label = period === "month" ? "Month" : period === "quarter" ? "Quarter" : "Year";
  return {
    summary: [
      ["Metric", "Value", "Change"],
      [`Revenue (${label})`, data.stats.mtdRevenue, data.statTrends.mtdRevenue],
      ["YTD Revenue", data.stats.ytdRevenue, data.statTrends.ytdRevenue],
      [`Orders (${label})`, String(data.stats.ordersMtd), data.statTrends.ordersMtd],
      ["Repeat Rate", `${data.stats.repeatRate}%`, data.statTrends.repeatRate],
    ],
    categories: [
      ["Category", "% Share", "Orders"],
      ...data.categories.map((c) => [c.name, `${c.pct}%`, String(c.orders)]),
    ],
    cities: [
      ["City", "Orders"],
      ...data.cities.map((c) => [c.name, String(c.orders)]),
    ],
    chefs: [
      ["Chef", "City", "Orders", "Revenue", "Rating", "Badge"],
      ...data.chefs.map((c) => [c.name, c.city, String(c.orders), c.revenue, String(c.rating), c.badge ?? "-"]),
    ],
    metrics: [
      ["Metric", "Value", "Change"],
      ...data.keyMetrics.map((m) => [m.metric, m.value, m.change]),
    ],
    revenue: [
      ["Period", "Revenue"],
      ...data.revenueBars.map((b) => [b.label, formatAmount(b.amount)]),
    ],
  };
}

function exportCSV(data: PeriodData, period: Period) {
  const rows = buildExportRows(data, period);
  const sections = [
    "=== SUMMARY ===",
    ...rows.summary.map((r) => r.join(",")),
    "",
    "=== REVENUE TREND ===",
    ...rows.revenue.map((r) => r.join(",")),
    "",
    "=== ORDERS BY CATEGORY ===",
    ...rows.categories.map((r) => r.join(",")),
    "",
    "=== TOP CITIES ===",
    ...rows.cities.map((r) => r.join(",")),
    "",
    "=== CHEF PERFORMANCE ===",
    ...rows.chefs.map((r) => r.join(",")),
    "",
    "=== KEY METRICS ===",
    ...rows.metrics.map((r) => r.join(",")),
  ];
  const blob = new Blob([sections.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifoo-analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(data: PeriodData, period: Period) {
  const XLSX = await import("xlsx");
  const rows = buildExportRows(data, period);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.summary), "Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.revenue), "Revenue Trend");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.categories), "Categories");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.cities), "Top Cities");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.chefs), "Chefs");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.metrics), "Key Metrics");
  XLSX.writeFile(wb, `lifoo-analytics-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async function exportPDF(data: PeriodData, period: Period) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const rows = buildExportRows(data, period);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const periodLabel = period === "month" ? "This Month" : period === "quarter" ? "This Quarter" : "This Year";

  // Header
  doc.setFontSize(18);
  doc.setTextColor(0, 132, 78);
  doc.text("LiFoo — Analytics & Reporting", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${periodLabel}  |  Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 28);
  doc.setDrawColor(0, 132, 78);
  doc.setLineWidth(0.5);
  doc.line(14, 31, 196, 31);

  let y = 38;
  const sections: Array<{ title: string; rows: string[][] }> = [
    { title: "Summary", rows: rows.summary },
    { title: "Revenue Trend", rows: rows.revenue },
    { title: "Orders by Category", rows: rows.categories },
    { title: "Top Cities", rows: rows.cities },
    { title: "Chef Performance", rows: rows.chefs },
    { title: "Key Metrics", rows: rows.metrics },
  ];

  for (const section of sections) {
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(section.title, 14, y);
    y += 4;
    autoTable(doc, {
      head: [section.rows[0]],
      body: section.rows.slice(1),
      startY: y,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [0, 132, 78], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 250, 245] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 260) { doc.addPage(); y = 20; }
  }

  doc.save(`lifoo-analytics-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({ id, label, value, trend, up, hint }: { id: string; label: string; value: string; trend: string; up: boolean; hint: string }) {
  return (
    <Card id={id} className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-5 pb-4 px-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        <div className="flex items-end justify-between gap-2">
          <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
          <span className={`flex items-center gap-0.5 text-xs font-medium mb-0.5 ${up ? "text-emerald-600" : "text-rose-500"}`}>
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
      </CardContent>
    </Card>
  );
}

function CategoryBar({ name, pct, orders, highlight }: { name: string; pct: number; orders: number; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 group">
      <span className={`w-28 shrink-0 text-xs font-medium truncate ${highlight ? "text-amber-600" : "text-foreground"}`}>{name}</span>
      <div className="relative flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${highlight ? "bg-amber-400" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{pct}%</span>
      <span className="hidden group-hover:block text-[10px] text-muted-foreground whitespace-nowrap">{orders.toLocaleString()} orders</span>
    </div>
  );
}

function CityRow({ name, orders, maxOrders, link }: { name: string; orders: number; maxOrders: number; link?: boolean }) {
  const pct = Math.round((orders / maxOrders) * 100);
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={link ? "text-primary font-medium hover:underline cursor-pointer" : "text-foreground"}>{name}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
          <div className="h-full bg-primary/50 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">{orders.toLocaleString()} orders</span>
      </div>
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────

export function AnalyticsModule() {
  const [activeTab, setActiveTab] = useState<Period>("month");
  const [exporting, setExporting] = useState<"csv" | "excel" | "pdf" | null>(null);

  const data = useMemo(() => periodData[activeTab], [activeTab]);

  const maxCityOrders = useMemo(
    () => Math.max(...data.cities.map((c) => c.orders)),
    [data]
  );

  const statCardItems = useMemo(() => {
    const d = data;
    const t = d.statTrends;
    const s = d.stats;
    return [
      { id: "kpi-revenue", label: activeTab === "year" ? "YTD REVENUE" : activeTab === "quarter" ? "QTD REVENUE" : "MTD REVENUE", value: s.mtdRevenue, trend: t.mtdRevenue, up: t.mtdUp, hint: activeTab === "year" ? "vs last year" : "vs last period" },
      { id: "kpi-ytd", label: "YTD REVENUE", value: s.ytdRevenue, trend: t.ytdRevenue, up: t.ytdUp, hint: "vs last year" },
      { id: "kpi-orders", label: activeTab === "year" ? "ORDERS YTD" : activeTab === "quarter" ? "ORDERS QTD" : "ORDERS MTD", value: s.ordersMtd.toLocaleString(), trend: t.ordersMtd, up: t.ordersUp, hint: "vs last period" },
      { id: "kpi-repeat", label: "REPEAT RATE", value: `${s.repeatRate}%`, trend: t.repeatRate, up: t.rateUp, hint: "returning customers" },
    ];
  }, [data, activeTab]);

  const handleExport = async (type: "csv" | "excel" | "pdf") => {
    setExporting(type);
    try {
      if (type === "csv") {
        exportCSV(data, activeTab);
        toast.success("CSV downloaded successfully");
      } else if (type === "excel") {
        await exportExcel(data, activeTab);
        toast.success("Excel file downloaded successfully");
      } else {
        await exportPDF(data, activeTab);
        toast.success("PDF downloaded successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to export ${type.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  const periodLabel = activeTab === "month" ? "This month" : activeTab === "quarter" ? "This quarter" : "This year";
  const badgeLabel = activeTab === "month" ? "MTD" : activeTab === "quarter" ? "QTD" : "YTD";

  return (
    <>
      <PageHeader
        title="Analytics & Reporting"
        description="Revenue, orders, customers and chef performance"
        actions={
          <>
            {/* Period Tabs */}
            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
              {(["month", "quarter", "year"] as const).map((t) => (
                <button
                  key={t}
                  id={`analytics-tab-${t}`}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize cursor-pointer select-none ${activeTab === t
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {t === "month" ? "This Month" : t === "quarter" ? "This Quarter" : "This Year"}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <Button
              variant="outline"
              size="sm"
              id="export-csv"
              onClick={() => handleExport("csv")}
              disabled={exporting !== null}
            >
              {exporting === "csv" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1" />}
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              id="export-excel"
              onClick={() => handleExport("excel")}
              disabled={exporting !== null}
            >
              {exporting === "excel" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />}
              Excel
            </Button>
            <Button
              size="sm"
              id="export-pdf"
              onClick={() => handleExport("pdf")}
              disabled={exporting !== null}
              className="bg-primary text-primary-foreground"
            >
              {exporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1" />}
              PDF
            </Button>
          </>
        }
      />

      <PageBody>
        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCardItems.map((card) => <StatCard key={card.id} {...card} />)}
        </div>

        {/* ── Orders by Category + Top Cities ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card id="orders-by-category">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Orders by Category</CardTitle>
                <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                  <ShoppingBag className="h-3 w-3 mr-1" />{badgeLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {data.categories.map((cat) => <CategoryBar key={cat.name} {...cat} />)}
            </CardContent>
          </Card>

          <Card id="top-cities">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />Top Cities
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">By order volume · {badgeLabel}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.cities.map((city) => (
                <CityRow key={city.name} {...city} maxOrders={maxCityOrders} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Revenue Trend + Key Metrics ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2" id="revenue-trend">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />Revenue Trend
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-primary">
                    {formatAmount(data.revenueBars.reduce((s, b) => s + b.amount, 0))}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {activeTab === "month" ? "Last 14 days" : activeTab === "quarter" ? "Last 14 weeks" : "Monthly"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Y-axis + bars */}
              <div className="flex gap-2">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-[9px] text-muted-foreground text-right shrink-0 h-40 pb-0">
                  {(() => {
                    const maxAmt = Math.max(...data.revenueBars.map((b) => b.amount));
                    return [100, 75, 50, 25, 0].map((pct) => (
                      <span key={pct}>{pct === 0 ? "0" : formatAmount(Math.round(maxAmt * pct / 100))}</span>
                    ));
                  })()}
                </div>
                {/* Bars */}
                <div className="flex-1">
                  <div className="relative flex items-end gap-1 h-40">
                    {/* Horizontal grid lines */}
                    {[75, 50, 25].map((pct) => (
                      <div
                        key={pct}
                        className="absolute left-0 right-0 border-t border-dashed border-border/40"
                        style={{ bottom: `${pct}%` }}
                      />
                    ))}
                    {data.revenueBars.map((bar, i) => (
                      <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                          <div className="bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                            <div className="font-semibold">{formatAmount(bar.amount)}</div>
                            <div className="opacity-70">{bar.label}</div>
                          </div>
                          <div className="w-1.5 h-1.5 bg-foreground rotate-45 -mt-1" />
                        </div>
                        {/* Bar */}
                        <div
                          className="w-full rounded-t bg-primary/70 hover:bg-primary transition-all duration-300 cursor-default"
                          style={{ height: `${bar.pct}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  {/* X-axis date labels — show every 2nd */}
                  <div className="flex gap-1 mt-1.5">
                    {data.revenueBars.map((bar, i) => (
                      <div key={i} className="flex-1 text-center">
                        {i % 2 === 0 && (
                          <span className="text-[8px] text-muted-foreground leading-none block truncate">{bar.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="quick-metrics">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Key Metrics · <span className="text-muted-foreground font-normal">{periodLabel}</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.keyMetrics.map((item) => (
                <div key={item.metric} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{item.value}</span>
                    <span className={`text-[10px] font-medium ${item.up ? "text-emerald-600" : "text-rose-500"}`}>{item.change}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Chef Performance Table ── */}
        <Card id="chef-performance">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ChefHat className="h-4 w-4 text-muted-foreground" />Top Performing Chefs
              </CardTitle>
              <span className="text-[10px] text-muted-foreground">{periodLabel}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["Chef", "City", "Orders", "Revenue", "Rating", "Status"].map((h, i) => (
                      <th key={h} className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${i >= 2 && i <= 4 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.chefs.map((chef, i) => (
                    <tr key={chef.name} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</div>
                          <span className="font-medium text-foreground">{chef.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{chef.city}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{chef.orders.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-primary">{chef.revenue}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold text-xs">★ {chef.rating}</span>
                      </td>
                      <td className="px-5 py-3">
                        {chef.badge ? (
                          <Badge variant="outline" className={`text-[10px] font-medium px-2 py-0.5 ${chef.badge === "Top Chef" ? "border-primary/30 bg-primary/5 text-primary" : "border-amber-300 bg-amber-50 text-amber-700"}`}>
                            {chef.badge}
                          </Badge>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── Customer Acquisition + Refund Overview ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card id="customer-acquisition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />Customer Acquisition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5">
                {data.acquisition.map((src) => (
                  <div key={src.label} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-xs text-muted-foreground">{src.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${src.color}`} style={{ width: `${src.pct}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-semibold">{src.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card id="refund-overview">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />Refunds &amp; Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {data.refunds.map((m) => (
                  <div key={m.label} className="rounded-lg bg-muted/30 border p-3">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{m.label}</p>
                    <p className="text-lg font-semibold text-foreground">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
