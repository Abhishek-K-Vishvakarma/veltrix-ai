import type { Metadata } from "next";
import { PreferencesProvider } from "@/components/settings/preferences-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VELTRIX AI",
    template: "%s | VELTRIX AI",
  },
  description:
    "Evidence in. Verified action out. Analyze, reason, verify, and act with VELTRIX AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
