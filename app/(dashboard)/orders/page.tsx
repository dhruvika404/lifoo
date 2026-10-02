import type { Metadata } from "next";
import { OrdersModule } from "@/rendering/orders";

export const metadata: Metadata = {
  title: "Orders Management — LiFoo Admin",
  description: "Monitor and manage customer orders and fulfillment status",
};

export default function Page() {
  return <OrdersModule />;
}
