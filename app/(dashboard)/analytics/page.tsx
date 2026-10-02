import type { Metadata } from "next";
import { AnalyticsModule } from "@/rendering/analytics";

export const metadata: Metadata = {
  title: "Analytics & Reporting — LiFoo Admin",
  description: "Revenue, orders, customers and chef performance analytics",
};

export default function Page() {
  return <AnalyticsModule />;
}
