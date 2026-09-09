import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="flex h-svh overflow-hidden">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
