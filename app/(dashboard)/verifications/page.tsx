import type { Metadata } from "next";
import { VerificationsModule } from "@/rendering/verifications";

export const metadata: Metadata = {
  title: "Verifications — LiFoo Admin",
  description: "Verify chef compliance before activation",
};

export default function Page() {
  return <VerificationsModule />;
}
