import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function ProfileLayout({ children }: LayoutProps<"/profile">) {
  return <DashboardShell>{children}</DashboardShell>;
}
