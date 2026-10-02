import type { Metadata } from "next";
import { CouponsModule } from "@/rendering/coupons";

export const metadata: Metadata = {
  title: "Coupons & Promotions — LiFoo Admin",
  description: "Manage, configure, and schedule customer coupons, referral offers, and discount campaigns.",
};

export default function Page() {
  return <CouponsModule />;
}
