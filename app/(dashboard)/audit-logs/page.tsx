import type { Metadata } from "next";
import { AuditLogsModule } from "@/rendering/auditLogs";

export const metadata: Metadata = {
  title: "Audit Logs — LiFoo Admin",
  description: "View and filter admin and system audit logs",
};

export default function AuditLogsPage() {
  return <AuditLogsModule />;
}
