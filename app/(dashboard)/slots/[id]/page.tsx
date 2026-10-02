import type { Metadata } from "next";
import { SlotOrdersPage } from "@/rendering/slots/slotOrdersPage";

export const metadata: Metadata = {
  title: "Slot Orders — LiFoo Admin",
  description: "View orders for a specific slot",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SlotOrdersPage slotId={id} />;
}
