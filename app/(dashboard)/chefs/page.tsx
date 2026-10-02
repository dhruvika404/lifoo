import type { Metadata } from "next";
import { ChefsModule } from "@/rendering/chefs";

export const metadata: Metadata = {
  title: "Chefs — LiFoo Admin",
  description: "Onboard, manage, and monitor chefs",
};

export default function Page() {
  return <ChefsModule />;
}
