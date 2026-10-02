import type { Metadata } from "next";
import { CategoriesModule } from "@/rendering/categories";

export const metadata: Metadata = {
  title: "Categories — LiFoo Admin",
  description: "Organize the product catalog into categories, cuisines, dietary types, and goals",
};

export default function Page() {
  return <CategoriesModule />;
}