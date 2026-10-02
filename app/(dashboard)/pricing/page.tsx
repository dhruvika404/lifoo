import type { Metadata } from "next";
import { PricingConfigModule } from "@/rendering/pricing";

export const metadata: Metadata = {
  title: "Pricing Config — LiFoo Admin",
  description: "Configure delivery fee rules, distance and weight surcharges",
};

export default function Page() {
  return <PricingConfigModule />;
}
