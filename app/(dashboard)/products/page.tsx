import type { Metadata } from "next";
import { ProductsModule } from "@/rendering/products";

export const metadata: Metadata = {
  title: "Products — LiFoo Admin",
  description: "Approve, reject and manage products",
};

export default function Page() {
  return <ProductsModule />;
}
