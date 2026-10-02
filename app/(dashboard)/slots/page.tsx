import type { Metadata } from "next";
import { SlotsModule } from "@/rendering/slots";

export const metadata: Metadata = {
  title: "Slots — LiFoo Admin",
  description: "Manage pre-order cooking slots",
};

export default function Page() {
  return <SlotsModule />;
}
