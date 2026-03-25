import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invoicer — Free Professional Invoice Generator",
  description:
    "Create professional invoices in minutes with zero signup required. Start as a guest, save your work with an account. PDF export, email delivery, 170+ currencies, templates, and invoice tracking.",
  alternates: { canonical: "/" },
};
import {
  FileText,
  FileDown,
  LayoutTemplate,
  Mail,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  AnimatedSection,
  AnimatedDiv,
  AnimatedFeatureCard,
} from "./components/HomeAnimations";

const features = [
  {
    icon: FileText,
    title: "No signup required to start",
    description:
      "Begin creating invoices instantly as a guest. No forms, no verification emails, no friction. Sign up later to save your work.",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconBorder: "border-blue-200 dark:border-blue-800",
    beamColor: "#60a5fa",
    glow: "bg-blue-400",
  },
  {
    icon: FileDown,
    title: "PDF export & email delivery",
    description:
      "Export to PDF with your branding and company details. Or send directly to clients with the PDF automatically attached.",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconBorder: "border-violet-200 dark:border-violet-800",
    beamColor: "#a78bfa",
    glow: "bg-violet-400",
  },
  {
    icon: LayoutTemplate,
    title: "Save time with templates",
    description:
      "Save any invoice as a template. For recurring clients or standard services, populate an entire invoice in seconds.",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconBorder: "border-emerald-200 dark:border-emerald-800",
    beamColor: "#34d399",
    glow: "bg-emerald-400",
  },
  {
    icon: Mail,
    title: "Track everything",
    description:
      "Monitor payment status, mark invoices as sent or paid, track overdue and due-soon items, and access analytics on revenue trends.",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconBorder: "border-rose-200 dark:border-rose-800",
    beamColor: "#fb7185",
    glow: "bg-rose-400",
  },
];

const steps = [
  {
    number: "01",
    title: "Start immediately",
    description:
      "No signup required. Just add your company details, pick your invoice template, and start creating. Or continue as guest.",
  },
  {
    number: "02",
    title: "Build and customize",
    description:
      "Fill in customer details, add line items, set your currency, apply discounts or taxes, and preview in real-time.",
  },
  {
    number: "03",
    title: "Send or save",
    description:
      "Email the invoice directly or export as PDF. Create an account to save all invoices, templates, and customer data.",
  },
];

const perks = [
  "Start as guest or sign up to save work",
  "170+ currencies with live conversion rates",
  "Professional PDF generation with branding",
  "Customer management & address book",
  "Revenue analytics & trend charts",
  "Invoice status tracking & due date alerts",
  "Bulk actions on multiple invoices",
  "Email invoices directly to clients",
];

const lineItems = [
  { label: "Web design — 3 hrs", amount: "£900" },
  { label: "Development — 8 hrs", amount: "£3,200" },
  { label: "Hosting setup — 1×", amount: "£100" },
];

function InvoicePreview() {
  return (
    <div className="relative flex items-center justify-center py-16 px-6">
      {/* Glow behind card */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-indigo-100 opacity-70 blur-3xl dark:bg-indigo-950/50" />

      {/* Rotated back card (depth effect) */}
      <div
        className="absolute z-0 h-67 w-72 rounded-2xl border border-(--border) bg-(--surface-raised)"
        style={{
          transform: "rotate(4deg) translateY(6px)",
          animation: "invoice-float 4s ease-in-out 0.4s infinite",
        }}
      />

      {/* Main invoice card */}
      <div
        className="relative z-10 w-72 rounded-2xl border border-(--border) bg-white p-5 shadow-2xl shadow-black/10 dark:bg-[#1a1a1a]"
        style={{ animation: "invoice-float 4s ease-in-out infinite" }}
      >
        {/* Invoice header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-black dark:bg-white" />
              <span className="text-xs font-bold text-black dark:text-white">
                Acme Studio
              </span>
            </div>
            <p className="text-[11px] text-(--muted)">invoice@acmestudio.co</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-(--muted)">
              Invoice
            </p>
            <p className="text-sm font-bold text-black dark:text-white">
              #INV-2841
            </p>
          </div>
        </div>

        {/* Bill to */}
        <div className="mb-4 rounded-lg bg-(--surface-raised) p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-(--muted)">
            Bill to
          </p>
          <p className="text-sm font-semibold text-black dark:text-white">
            Bright Digital Ltd
          </p>
          <p className="text-[11px] text-(--muted)">
            billing@brightdigital.com
          </p>
        </div>

        {/* Line items */}
        <div className="mb-4 space-y-2.5">
          {lineItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-(--muted)">{item.label}</span>
              <span className="font-medium text-black dark:text-white">
                {item.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-(--border) pt-3">
          <span className="text-xs font-semibold text-(--muted)">
            Total due
          </span>
          <span className="text-base font-bold text-black dark:text-white">
            £4,200.00
          </span>
        </div>
      </div>

      {/* Floating pill — Invoice sent */}
      <div
        className="absolute right-0 top-10 z-20 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 shadow-xl shadow-black/25 dark:bg-white"
        style={{ animation: "invoice-float 4s ease-in-out 0.8s infinite" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="whitespace-nowrap text-xs font-semibold text-white dark:text-black">
          Invoice sent
        </span>
      </div>

      {/* Floating pill — PDF ready */}
      <div
        className="absolute bottom-10 left-0 z-20 flex items-center gap-1.5 rounded-full border border-(--border) bg-white px-3 py-1.5 shadow-lg dark:bg-[#1a1a1a]"
        style={{ animation: "invoice-float 4s ease-in-out 1.4s infinite" }}
      >
        <FileDown className="h-3 w-3 text-(--muted)" />
        <span className="whitespace-nowrap text-xs font-medium text-(--muted)">
          PDF ready
        </span>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-white dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <AnimatedDiv className="lg:grid lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-12">
            {/* Left: copy */}
            <div>
              {/* Pill badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                Free · Fast · Professional
              </div>

              <h1 className="max-w-xl text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl leading-[1.1]">
                <span className="block">Invoicing that stays</span>
                <span className="bg-linear-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-500">
                  out of your way.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-(--muted)">
                Create and send professional invoices in minutes. Start
                immediately as a guest, no signup required. Save your work and
                track payments by creating an account.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/invoices/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-7 py-3.5 font-semibold text-white transition-colors hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                  Create an invoice
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-7 py-3.5 font-semibold text-black transition-colors hover:bg-(--surface-raised) dark:text-white"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            {/* Right: animated invoice preview */}
            <div className="hidden lg:block">
              <InvoicePreview />
            </div>
          </AnimatedDiv>
        </section>

        {/* ── Stats strip ─────────────────────────────────────── */}
        <AnimatedSection className="border-y border-(--border) bg-(--surface)">
          <div className="mx-auto max-w-5xl px-6 grid grid-cols-3 divide-x divide-(--border)">
            {[
              { value: "< 2 min", label: "To create & send" },
              { value: "170+", label: "Supported currencies" },
              { value: "0", label: "Signup required to start" },
            ].map((stat) => (
              <div key={stat.label} className="py-6 px-4 text-center sm:px-8">
                <p className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-(--muted) sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ── Features grid ───────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mt-2 text-(--muted)">
            Core invoicing tools, thoughtfully assembled.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
            {features.map((feature, i) => (
              <AnimatedFeatureCard key={feature.title} index={i}>
                <div className="group relative transition-transform  duration-300 hover:-translate-y-0.5">
                  {/* 1px border wrapper — clips the rotating beam */}
                  <div className="relative overflow-hidden rounded-2xl p-px">
                    {/* Static border background */}
                    <div className="absolute inset-0 bg-(--border)" />

                    {/* Rotating beam — fades in on hover */}
                    <div
                      className="pointer-events-none absolute opacity-0 transition-opacity duration-500 group-hover:opacity-100 "
                      style={{
                        width: "200%",
                        height: "200%",
                        top: "-50%",
                        left: "-50%",
                        animation: "border-rotate 2.5s linear infinite",
                        background: `conic-gradient(transparent 240deg, ${feature.beamColor} 290deg, ${feature.beamColor} 345deg, transparent 360deg)`,
                      }}
                    />

                    {/* Card content */}
                    <div className="relative z-10 overflow-hidden rounded-[15px] bg-white dark:bg-black px-10 py-5">
                      {/* Inner corner glow blob */}
                      <div
                        className={`pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-20 ${feature.glow}`}
                      />

                      {/* Icon */}
                      <div className="pt-6 pb-4">
                        <div
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${feature.iconBorder} ${feature.iconBg} ${feature.iconColor}`}
                        >
                          <feature.icon className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Text */}
                      <div className="pb-6">
                        <h3 className="text-sm font-semibold text-black dark:text-white py-2">
                          {feature.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-(--muted) py-2">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedFeatureCard>
            ))}
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────── */}
        <div className="border-t border-(--border)" />
        <AnimatedSection className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Up and running in three steps.
          </h2>
          <p className="mt-2 text-(--muted)">
            No tutorials, no onboarding flows — just open and go.
          </p>

          <div className="relative mt-10 isolate">
            {/* Single dashed line behind all three steps */}
            <div
              className="absolute inset-x-0 top-7.5 hidden -z-10 sm:block"
              style={{ borderTop: "2px dashed var(--border)", width: "69%" }}
            />
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative z-10 flex flex-col gap-3"
                >
                  <span className="inline-block w-fit select-none bg-white pr-3 text-6xl font-black leading-none tracking-tight text-(--border) dark:bg-black">
                    {step.number}
                  </span>
                  <h3 className="font-semibold text-black dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-(--muted)">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── Perks ───────────────────────────────────────────── */}
        <AnimatedSection className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Powerful features for every business.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                Everything from invoice creation to detailed analytics, designed
                to help you manage payments and grow your business.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-2.5 text-sm text-black dark:text-white"
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <AnimatedSection className="mx-auto max-w-5xl px-6 pb-20">
          <div className="rounded-2xl bg-black px-8 py-14 text-center dark:bg-white sm:px-14">
            <h3 className="text-2xl font-bold text-white dark:text-black sm:text-3xl">
              Ready to create your first invoice?
            </h3>
            <p className="mt-3 text-sm text-gray-400 dark:text-gray-600">
              Start now — no signup required. Save your work by creating an
              account anytime.
            </p>
            <div className="mt-7">
              <Link
                href="/invoices/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-black transition-colors hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900"
              >
                Create invoice
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <footer className="border-t border-(--border) bg-(--surface)">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-center text-sm text-(--muted)">
            © 2026 Invoice Generator. Simple invoicing for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
