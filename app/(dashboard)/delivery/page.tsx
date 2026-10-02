import type { Metadata } from "next";
import { DeliveryModule } from "@/rendering/delivery";

export const metadata: Metadata = {
  title: "Delivery Management — LiFoo Admin",
  description: "Monitor active deliveries, assign riders, and track routing",
};

export default function Page() {
  return <DeliveryModule />;
}
