import type { Metadata } from "next";
import { AdminDashboardModule } from "@/rendering/adminDashboard";

export const metadata: Metadata = {
  title: "Dashboard — LiFoo Admin",
  description: "Real-time platform performance dashboard",
};

export default function Page() {
  return <AdminDashboardModule />;
}
