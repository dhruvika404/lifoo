import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiFoo Admin Portal",
  description: "LiFoo logistics, delivery management, and role-based permissions access panel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "font-sans",
            style: {
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              padding: "12px 16px",
            },
            success: {
              style: {
                backgroundColor: "oklch(0.98 0.015 150)",
                color: "oklch(0.25 0.08 150)",
                border: "1px solid oklch(0.92 0.03 150)",
              },
              iconTheme: {
                primary: "oklch(0.62 0.15 150)",
                secondary: "#ffffff",
              },
            },
            error: {
              style: {
                backgroundColor: "oklch(0.98 0.02 27)",
                color: "oklch(0.35 0.12 27)",
                border: "1px solid oklch(0.92 0.05 27)",
              },
              iconTheme: {
                primary: "oklch(0.58 0.22 27)",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

