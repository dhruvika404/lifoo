import type { Metadata } from "next";
import { RolesModule } from "@/rendering/roles";

export const metadata: Metadata = {
  title: "Access Roles — LiFoo Admin",
  description: "Configure access levels and permissions for predefined and custom roles",
};

export default function Page() {
  return <RolesModule />;
}
