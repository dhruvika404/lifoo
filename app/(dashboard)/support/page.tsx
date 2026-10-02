import type { Metadata } from "next";
import { CustomerSupportModule } from "@/rendering/support";

export const metadata: Metadata = {
  title: "Customer Support — LiFoo Admin",
  description: "Manage, respond to, and resolve customer support tickets and inquiries.",
};

export default function Page() {
  return <CustomerSupportModule />;
}
