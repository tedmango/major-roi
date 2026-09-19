import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Degree Payback",
  description: "What a major earns, what it costs, and when it pays for itself",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
