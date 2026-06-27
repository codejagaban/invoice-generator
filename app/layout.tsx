import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
import AppShell from "@/app/components/AppShell";
import DbScopeProvider from "@/app/components/DbScopeProvider";
import SessionProviderWrapper from "@/app/components/SessionProviderWrapper";
import { Toaster } from "sonner";
import "./globals.css";


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.invoicer.cv";

export const metadata: Metadata = {
  title: {
    default: "Invoicer — Professional Invoice Generator",
    template: "%s | Invoicer",
  },
  description:
    "Create, manage, and send professional invoices in minutes. Free invoice generator with PDF export, email delivery, multi-currency support, and analytics dashboard.",
  keywords: [
    "invoice generator",
    "free invoicing",
    "invoice maker",
    "PDF invoice",
    "send invoice",
    "freelancer invoice",
    "small business invoice",
    "online invoicing",
    "invoice template",
    "billing software",
  ],
  authors: [{ name: "Invoicer" }],
  creator: "Invoicer",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Invoicer",
    title: "Invoicer — Professional Invoice Generator",
    description:
      "Create, manage, and send professional invoices in minutes. PDF export, email delivery, 170+ currencies, and analytics.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invoicer — Professional Invoice Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoicer — Professional Invoice Generator",
    description:
      "Create, manage, and send professional invoices in minutes. PDF export, email delivery, 170+ currencies.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="dbf103bc-d0fa-4355-bc65-1b4b2cca9ceb" />
      </head>
      <body className={`${geist.className} ${geistMono.variable} antialiased`}>
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
