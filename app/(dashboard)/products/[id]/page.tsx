import type { Metadata } from "next";
import { ProductDetailsModule } from "@/rendering/products/productDetailsPage";

export const metadata: Metadata = {
  title: "Product Details — LiFoo Admin",
  description: "View and manage product details",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailsModule productId={id} />;
}
