import Link from "next/link";
import { Layers } from "lucide-react";

/** Centred shell for the signed-out pages — no sidebar, no top bar. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex items-center gap-2">
        <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Layers className="size-4" />
        </span>
        <span className="text-base font-semibold">DevStash</span>
      </Link>

      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
