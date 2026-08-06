import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { ApplicationLayout } from "@/components/application-layout";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Engineering Onboarding Copilot",
  description: "Grounded AI assistant for engineering onboarding knowledge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <ApplicationLayout>{children}</ApplicationLayout>
      </body>
    </html>
  );
}
