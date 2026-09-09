import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · DevStash",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Your developer knowledge hub</p>

      {/* Collections grid and pinned items arrive in phase 2. */}
      <h2 className="mt-8 text-lg font-semibold">Main</h2>
    </div>
  );
}
