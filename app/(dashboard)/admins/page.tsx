import type { Metadata } from "next";
import { AdminsModule } from "@/rendering/admins";

export const metadata: Metadata = {
  title: "Admin Users — LiFoo Admin",
  description: "Manage admin accounts and roles (RBAC)",
};

export default function Page() {
  return <AdminsModule />;
}
