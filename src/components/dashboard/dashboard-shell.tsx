import { cookies } from "next/headers";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

/** Sidebar + top bar frame shared by every signed-in route. */
export async function DashboardShell({ children }: DashboardShellProps) {
  // Written by SidebarProvider so the open/closed state survives a reload.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="h-svh min-h-svh overflow-hidden"
    >
      <DashboardSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <DashboardTopbar />
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
