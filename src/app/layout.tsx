import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PersonaProvider } from "@/providers/PersonaProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignalPath — Career OS",
  description:
    "Evidence-backed career navigation. Build a living portfolio, discover realistic career paths, and connect with opportunities through auditable proof.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <PersonaProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </PersonaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
