import type { Metadata } from "next";
import { AttributesModule } from "@/rendering/attributes";

export const metadata: Metadata = {
  title: "Attributes — LiFoo Admin",
  description: "Manage product attributes like nutritions, ingredients, and keywords",
};

export default function Page() {
  return <AttributesModule />;
}
