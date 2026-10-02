import type { Metadata } from "next";
import { StreamsModule } from "@/rendering/streams";

export const metadata: Metadata = {
  title: "Streams — LiFoo Admin",
  description: "Monitor live cooking streams or view recorded sessions",
};

export default function Page() {
  return <StreamsModule />;
}
