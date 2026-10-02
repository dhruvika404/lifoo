import type { Metadata } from "next";
import { CategoryDetailsPage } from "@/rendering/categories/categoryDetailsPage";

export const metadata: Metadata = {
  title: "Category Details — LiFoo Admin",
  description: "View category details and subcategories",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryDetailsPage categoryId={id} />;
}
