import { AppSidebar } from "@/components/features/navigation/app-sidebar";
import { SiteHeader } from "@/components/features/navigation/site-header";
import { SidebarInset, SidebarProvider } from "@/components/primitives";

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="[--header-height:calc(var(--spacing-14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
