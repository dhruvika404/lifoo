import type { Metadata } from "next";
import { RefundsModule } from "@/rendering/refunds";

export const metadata: Metadata = {
  title: "Refunds & Disputes — LiFoo Admin",
  description: "Review customer refund requests and manage chargebacks.",
};

export default function Page() {
  return <RefundsModule />;
}
