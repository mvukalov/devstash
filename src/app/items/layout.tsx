import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function ItemsLayout({ children }: LayoutProps<"/items">) {
  return <DashboardShell>{children}</DashboardShell>;
}
