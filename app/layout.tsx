import type { Metadata } from "next";
import { Onest } from "next/font/google";

const onest = Onest({
  subsets: ["latin"],
});
import AppShell from "@/app/components/AppShell";
import DbScopeProvider from "@/app/components/DbScopeProvider";
import SessionProviderWrapper from "@/app/components/SessionProviderWrapper";
import { Toaster } from "sonner";
import "./globals.css";


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
      <body className={`${onest.className} antialiased`}>
        <SessionProviderWrapper>
          <DbScopeProvider>
            <AppShell>{children}</AppShell>
          </DbScopeProvider>
        </SessionProviderWrapper>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
