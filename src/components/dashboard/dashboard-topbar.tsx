import { FolderPlus, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Top bar — the sidebar toggle is live; the search field is not wired to any
 * query yet and neither button opens the item drawer.
 */
export function DashboardTopbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="hidden sm:block" />

      <div className="relative w-full max-w-md">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search items..."
          aria-label="Search items"
          className="h-9 pr-16 pl-9"
        />
        <kbd className="text-muted-foreground bg-muted pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[0.7rem] sm:block">
          ⌘K
        </kbd>
      </div>

      {/* Labels drop to icons below lg so the search field keeps its width. */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button variant="outline" size="lg" aria-label="New collection">
          <FolderPlus />
          <span className="hidden lg:inline">New Collection</span>
        </Button>
        <Button size="lg" aria-label="New item">
          <Plus />
          <span className="hidden lg:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
