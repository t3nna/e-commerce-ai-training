import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baseline Checkout",
  description: "A small checkout training application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
