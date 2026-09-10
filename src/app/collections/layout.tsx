import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function CollectionsLayout({
  children,
}: LayoutProps<"/collections">) {
  return <DashboardShell>{children}</DashboardShell>;
}
