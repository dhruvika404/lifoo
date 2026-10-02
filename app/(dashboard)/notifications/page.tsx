import type { Metadata } from "next";
import { NotificationsModule } from "@/rendering/notifications";

export const metadata: Metadata = {
  title: "Notifications — LiFoo Admin",
  description: "Manage and dispatch push notifications and alerts to customers and chefs.",
};

export default function Page() {
  return <NotificationsModule />;
}
