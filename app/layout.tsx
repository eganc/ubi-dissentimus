import type { Metadata } from "next";
import { copy } from "@/lib/copy";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.site.title,
  description: copy.site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
