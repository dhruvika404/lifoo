import type { Metadata } from "next";
import { CitiesModule } from "@/rendering/cities";

export const metadata: Metadata = {
  title: "Cities & Zones — LiFoo Admin",
  description: "Manage delivery cities and local operational zones",
};

export default function Page() {
  return <CitiesModule />;
}
