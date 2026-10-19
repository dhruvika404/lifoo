import type { Metadata } from "next";
import { SplashScreensModule } from "@/rendering/splash-screens";

export const metadata: Metadata = {
  title: "Splash Screens — LiFoo Admin",
  description: "Manage mobile app onboarding splash screens and targeting",
};

export default function Page() {
  return <SplashScreensModule />;
}
