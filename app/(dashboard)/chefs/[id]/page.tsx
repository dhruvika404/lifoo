import type { Metadata } from "next";
import { ChefDetailsModule } from "@/rendering/chefs/chefDetails";

export const metadata: Metadata = {
  title: "Chef Details — LiFoo Admin",
  description: "View chef details, KYC documents, addresses, and onboarding status",
};

export default function Page() {
  return <ChefDetailsModule />;
}
