import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/authGuard";
import { Header } from "@/components/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <Sidebar />
            <SidebarInset className="flex flex-1 flex-col h-screen overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AuthGuard>
  );
}

