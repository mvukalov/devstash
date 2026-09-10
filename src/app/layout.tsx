import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}
      style={{ colorScheme: "dark" }}
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
      </body>
    </html>
  );
}
