import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";

const golos = Golos_Text({
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
      <body className={`${golos.className} antialiased`}>
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
