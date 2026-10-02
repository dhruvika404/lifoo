import type { Metadata } from "next";
import { CustomersModule } from "@/rendering/customers";

export const metadata: Metadata = {
  title: "Customers — LiFoo Admin",
  description: "Manage customer accounts, wallets, and orders",
};

export default function Page() {
  return <CustomersModule />;
}
