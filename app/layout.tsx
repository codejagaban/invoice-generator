import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppShell from "@/app/components/AppShell";
import DbScopeProvider from "@/app/components/DbScopeProvider";
import SessionProviderWrapper from "@/app/components/SessionProviderWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice Generator",
  description: "Simple invoice generation for small businesses and freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SessionProviderWrapper>
          <DbScopeProvider>
            <AppShell>{children}</AppShell>
          </DbScopeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
