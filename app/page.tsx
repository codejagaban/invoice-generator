import type { Metadata } from "next";
import HomeLanding from "./components/HomeLanding";

export const metadata: Metadata = {
  title: "Invoicer — Free Professional Invoice Generator",
  description:
    "Create professional invoices in minutes with zero signup required. Start as a guest, save your work with an account. PDF export, email delivery, 170+ currencies, templates, and invoice tracking.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Invoicer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Create professional invoices in minutes. Start immediately as a guest, no signup required. Save your work by creating an account.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Start as guest with no signup required",
    "PDF invoice generation with branding",
    "Email invoices directly to clients",
    "170+ currency support with live conversion",
    "Reusable invoice templates",
    "Customer management and address book",
    "Invoice status tracking and alerts",
    "Analytics dashboard with revenue trends",
    "Bulk actions on invoices",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeLanding />
    </>
  );
}
