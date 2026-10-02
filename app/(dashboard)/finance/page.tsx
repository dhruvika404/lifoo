import type { Metadata } from "next";
import { FinanceModule } from "@/rendering/finance";

export const metadata: Metadata = {
  title: "Payouts & Settlement — LiFoo Admin",
  description: "Manage chef earnings withdrawals and bank transfers.",
};

export default function Page() {
  return <FinanceModule />;
}
