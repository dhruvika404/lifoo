import type { Metadata } from "next";
import { ReviewModerationModule } from "@/rendering/reviews";

export const metadata: Metadata = {
  title: "Review Moderation — LiFoo Admin",
  description: "Manage, review, and moderate customer ratings and comments on chefs and food items.",
};

export default function Page() {
  return <ReviewModerationModule />;
}
