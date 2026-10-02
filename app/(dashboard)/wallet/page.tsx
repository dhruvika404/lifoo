import type { Metadata } from "next";
import { WalletModule } from "@/rendering/wallet";

export const metadata: Metadata = {
  title: "Platform Wallet — LiFoo Admin",
  description: "Monitor system balances, user top-ups, and chef earnings.",
};

export default function Page() {
  return <WalletModule />;
}
