import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevStash",
  description: "Your developer knowledge hub",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `dark` is hardcoded for now — dark mode is the default and a light-mode
    // toggle is a later milestone.
    <html
      lang="en"
      className={`dark [color-scheme:dark] ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/*
        Browser extensions inject attributes into <body> before React hydrates
        (e.g. `__processed_<uuid>__`), which React reports as a hydration
        mismatch. This suppresses the warning for this element's own attributes
        only — a real mismatch inside the app still surfaces.
      */}
      <body
        className="bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        {children}

        {/*
          Mounted at the root so a toast survives the client-side navigation
          that raised it — registration, for one, fires its toast and then
          routes to /sign-in. `theme` is passed explicitly because the Toaster
          reads next-themes, which has no provider here: <html> hardcodes dark,
          so the default of "system" would render a light toast on a machine
          set to light.

          Success toasts are green. Rather than fight the inline
          `background: var(--normal-bg)` that sonner writes on every toast,
          this repoints those three variables for the success variant only, so
          the other variants keep the popover styling. `cn-toast` is repeated
          because passing toastOptions here replaces the wrapper's own.
        */}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "cn-toast",
              success:
                "[--normal-bg:var(--color-emerald-950)] [--normal-text:var(--color-emerald-50)] [--normal-border:var(--color-emerald-700)]",
            },
          }}
        />
      </body>
    </html>
  );
}
