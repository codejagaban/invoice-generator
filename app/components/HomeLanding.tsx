"use client";

/* Hallmark · pre-emit critique: P5 H4 E4 S4 R4 V4
 * genre: modern-minimal · macrostructure: Marquee Hero · theme: monochrome (Geist), dual-mode
 * tone: technical · anchor hue: neutral · nav: app top-bar · footer: Ft2 inline
 * motion: hero-entrance · marquee · hover-spotlight · invoice-float (composed, no scroll-reveal)
 * theme follows prefers-color-scheme: light (#fafafa/ink) and dark (#0a0a0a/white)
 */

/**
 * Home landing — modern-minimal (SaaS / Stripe-Linear school), dual-mode.
 * Geist sans throughout, Geist Mono for the technical/label register. Monochrome:
 * ink-on-paper in light, white-on-near-black in dark. The page is composed
 * (no scroll-fade); motion lives in the hero entrance, the marquee, and
 * interaction. The dot-grid and cursor-spotlight tints flip via the --home-dot
 * and --home-spot tokens. All motion gated by prefers-reduced-motion.
 */

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import {
  ArrowRight,
  Check,
  FileText,
  FileDown,
  LayoutTemplate,
  LineChart,
  Zap,
  Globe,
  ShieldCheck,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Content (truthful to product.md / existing copy) ─────────────────────────

const stats = [
  { value: "$0", label: "Free, no card" },
  { value: "170+", label: "Currencies, live rates" },
  { value: "0", label: "Signups to start" },
];

const currencies = [
  "USD", "EUR", "GBP", "JPY", "CNY", "INR", "AUD", "CAD",
  "CHF", "SEK", "NZD", "ZAR", "BRL", "MXN", "SGD", "HKD",
  "KRW", "AED", "NOK", "DKK",
];

const steps = [
  {
    n: "01",
    title: "Start immediately",
    body: "No signup. Add your company details, pick a template, and start. Or just continue as a guest.",
  },
  {
    n: "02",
    title: "Build and customize",
    body: "Fill in the customer, add line items, set a currency, apply tax or discounts, and preview in real time.",
  },
  {
    n: "03",
    title: "Send or save",
    body: "Email the invoice or export a branded PDF. Create an account to keep invoices, templates, and clients.",
  },
];

const perks = [
  "Guest mode, or sign up to save work",
  "170+ currencies with live conversion",
  "Branded PDF generation",
  "Customer address book",
  "Revenue analytics and trends",
  "Status tracking and due-date alerts",
  "Bulk actions across invoices",
  "Email invoices straight to clients",
];

const lineItems = [
  { label: "Web design, 3 hrs", amount: "£900" },
  { label: "Development, 8 hrs", amount: "£3,200" },
  { label: "Hosting setup", amount: "£100" },
];

// ── Hero entrance (the page's single orchestrated entrance) ──────────────────

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// ── Hero invoice asset (real product artifact) with pointer tilt ─────────────

function InvoiceAsset() {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div
      className="relative flex items-center justify-center [perspective:1200px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative"
      >
        <div
          className="absolute inset-0 -z-10 rounded-2xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.03]"
          style={{ transform: "rotate(4deg) translateY(8px)" }}
        />
        <div
          data-float
          className="w-72 rounded-2xl border border-black/10 bg-white p-5 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#141414] dark:shadow-black/60"
          style={{ animation: "invoice-float 5s ease-in-out infinite" }}
        >
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#0a0a0a] dark:bg-white" />
                <span className="text-xs font-semibold text-[#0a0a0a] dark:text-white">
                  Acme Studio
                </span>
              </div>
              <p className="text-[11px] text-black/45 dark:text-white/45">
                invoice@acmestudio.co
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45">
                Invoice
              </p>
              <p className="font-mono text-sm font-semibold text-[#0a0a0a] dark:text-white">
                #INV-2841
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-lg border border-black/5 bg-black/[0.03] p-3 dark:border-white/5 dark:bg-white/[0.03]">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-black/45 dark:text-white/45">
              Bill to
            </p>
            <p className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
              Bright Digital Ltd
            </p>
            <p className="text-[11px] text-black/45 dark:text-white/45">
              billing@brightdigital.com
            </p>
          </div>

          <div className="mb-4 space-y-2.5">
            {lineItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-black/55 dark:text-white/55">{item.label}</span>
                <span className="font-mono text-[#0a0a0a] dark:text-white">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-black/10 pt-3 dark:border-white/10">
            <span className="text-xs font-semibold text-black/55 dark:text-white/55">
              Total due
            </span>
            <span className="font-mono text-base font-semibold text-[#0a0a0a] dark:text-white">
              £4,200.00
            </span>
          </div>
        </div>

        {/* status pill — green dot is real state, not decoration. Inverts per scheme. */}
        <div
          data-float
          className="absolute -right-5 top-8 flex items-center gap-1.5 rounded-full bg-[#0a0a0a] px-3 py-1.5 shadow-xl shadow-black/30 dark:bg-white dark:shadow-black/40"
          style={{ animation: "invoice-float 5s ease-in-out 0.8s infinite" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="whitespace-nowrap text-xs font-semibold text-white dark:text-[#0a0a0a]">
            Invoice sent
          </span>
        </div>
        <div
          data-float
          className="absolute -left-6 bottom-10 flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 shadow-lg dark:border-white/15 dark:bg-[#141414]"
          style={{ animation: "invoice-float 5s ease-in-out 1.6s infinite" }}
        >
          <FileDown className="h-3 w-3 text-black/60 dark:text-white/60" />
          <span className="whitespace-nowrap text-xs font-medium text-black/70 dark:text-white/70">
            PDF ready
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Spotlight bento card (cursor-follow highlight via motion values) ─────────

function SpotlightCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // --home-spot flips with the colour scheme (ink-tint in light, white in dark)
  const bg = useMotionTemplate`radial-gradient(440px circle at ${mx}px ${my}px, var(--home-spot), transparent 70%)`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  return (
    <div
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] transition-colors duration-300 hover:border-black/20 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 ${className ?? ""}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: bg }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomeLanding() {
  const reduce = useReducedMotion();
  return (
    <div className="relative overflow-hidden bg-[#fafafa] text-[#0a0a0a] dark:bg-[#0a0a0a] dark:text-white">
      {/* page-wide subtle dot grid (colour flips via --home-dot) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(var(--home-dot) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <main className="relative">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-6 pb-20 pt-12">
          {/* single ambient bloom (static) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[14%] -z-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-black/5 blur-[120px] dark:bg-white/10"
          />

          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              variants={heroStagger}
              initial="hidden"
              animate="show"
              className="relative z-10"
            >
              <motion.div variants={heroItem}>
                <span className="inline-flex items-center rounded-full border border-black/15 bg-black/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black/60 dark:border-white/15 dark:bg-white/[0.04] dark:text-white/65">
                  Free, no signup to start
                </span>
              </motion.div>

              <motion.h1
                variants={heroItem}
                className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.03em] text-[#0a0a0a] sm:text-6xl dark:text-white"
              >
                Invoicing that stays
                <br />
                out of your way.
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="mt-6 max-w-md text-lg leading-relaxed text-black/60 dark:text-white/55"
              >
                Create and send professional invoices in minutes. Start as a
                guest, then save and track payments when you are ready.
              </motion.p>

              <motion.div
                variants={heroItem}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/invoices/create"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-7 py-3.5 font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-[#0a0a0a]"
                >
                  Create an invoice
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-full border border-black/15 px-7 py-3.5 font-medium text-[#0a0a0a] transition-colors duration-200 hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                >
                  View dashboard
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
              className="relative z-10 hidden justify-center lg:flex"
            >
              <InvoiceAsset />
            </motion.div>
          </div>
        </section>

        {/* ── Currency marquee (honest breadth, single marquee) ─── */}
        <section className="relative border-y border-black/10 py-7 dark:border-white/10">
          <p className="mb-5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
            170+ currencies, converted at live rates
          </p>
          <div
            className="relative flex overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div className="animate-marquee-x flex shrink-0 items-center gap-10 pr-10">
              {[...currencies, ...currencies].map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="font-mono text-sm tracking-wider text-black/35 dark:text-white/35"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats (honest values) ─────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 divide-y divide-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="px-4 py-10 sm:px-10">
                <p className="font-mono text-4xl font-semibold tracking-tight text-[#0a0a0a] tabular-nums dark:text-white">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-black/50 dark:text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature spotlight (split) ─────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#0a0a0a] sm:text-4xl dark:text-white">
                Everything you need.
                <br />
                Nothing you do not.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-black/60 dark:text-white/55">
                Open the editor and start typing. Line items, tax, discounts, and
                a live preview, with no onboarding flow standing between you and a
                finished invoice.
              </p>
              <Link
                href="/invoices/create"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#0a0a0a] dark:text-white"
              >
                Try the editor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-black/5 bg-black/[0.02] px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <span className="text-sm text-black/70 dark:text-white/70">
                      {item.label}
                    </span>
                    <span className="font-mono text-sm text-[#0a0a0a] dark:text-white">
                      {item.amount}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-4 py-3 dark:bg-white">
                  <span className="text-sm font-semibold text-white dark:text-[#0a0a0a]">
                    Total due
                  </span>
                  <span className="font-mono text-sm font-semibold text-white dark:text-[#0a0a0a]">
                    £4,200.00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento (4 features, 4 cells, varied) ───────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <SpotlightCard className="md:col-span-4">
              <div className="flex h-full flex-col justify-between gap-6 p-7">
                <div>
                  <Zap className="h-6 w-6 text-[#0a0a0a] dark:text-white" />
                  <h3 className="mt-4 text-lg font-semibold text-[#0a0a0a] dark:text-white">
                    No signup required to start
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-black/60 dark:text-white/55">
                    Begin instantly as a guest. No forms, no verification emails.
                    Sign up later to save your work.
                  </p>
                </div>
                <span className="self-start rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-black/55 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55">
                  Guest mode
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-2">
              <div className="flex h-full flex-col p-7">
                <FileDown className="h-6 w-6 text-[#0a0a0a] dark:text-white" />
                <h3 className="mt-4 text-lg font-semibold text-[#0a0a0a] dark:text-white">
                  PDF export and email
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/55">
                  Branded PDF, or send straight to the client with the file
                  attached.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-2">
              <div className="flex h-full flex-col p-7">
                <LayoutTemplate className="h-6 w-6 text-[#0a0a0a] dark:text-white" />
                <h3 className="mt-4 text-lg font-semibold text-[#0a0a0a] dark:text-white">
                  Reusable templates
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/55">
                  Save any invoice and populate the next one in seconds.
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="md:col-span-4">
              <div className="flex h-full flex-col justify-between gap-6 p-7 sm:flex-row sm:items-end">
                <div>
                  <LineChart className="h-6 w-6 text-[#0a0a0a] dark:text-white" />
                  <h3 className="mt-4 text-lg font-semibold text-[#0a0a0a] dark:text-white">
                    Track everything
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-black/60 dark:text-white/55">
                    Payment status, overdue and due-soon alerts, and revenue
                    trends at a glance.
                  </p>
                </div>
                <svg
                  viewBox="0 0 200 64"
                  className="h-16 w-full max-w-[220px] shrink-0 text-[#0a0a0a] dark:text-white"
                  aria-label="Revenue trend, upward"
                  role="img"
                >
                  <defs>
                    <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points="0,52 28,44 56,48 84,30 112,34 140,18 168,22 200,8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="0,52 28,44 56,48 84,30 112,34 140,18 168,22 200,8 200,64 0,64"
                    fill="url(#spark)"
                  />
                </svg>
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* ── How it works (numbered steps) ─────────────────────── */}
        <section className="border-t border-black/10 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#0a0a0a] sm:text-4xl dark:text-white">
              Up and running in three steps.
            </h2>
            <p className="mt-4 text-black/60 dark:text-white/55">
              No tutorials, no onboarding. Open and go.
            </p>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-3 dark:border-white/10 dark:bg-white/10">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="flex h-full flex-col gap-4 bg-[#fafafa] p-8 dark:bg-[#0a0a0a]"
                >
                  <span className="font-mono text-sm text-black/40 dark:text-white/40">
                    {step.n}
                  </span>
                  <h3 className="text-lg font-semibold text-[#0a0a0a] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/60 dark:text-white/55">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Perks (2-col grouped) ─────────────────────────────── */}
        <section className="border-t border-black/10 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <ShieldCheck className="h-7 w-7 text-[#0a0a0a] dark:text-white" />
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-[#0a0a0a] sm:text-4xl dark:text-white">
                  Built for real billing.
                </h2>
                <p className="mt-4 max-w-sm leading-relaxed text-black/60 dark:text-white/55">
                  From the first draft to paid, with the tooling small teams and
                  freelancers actually use.
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] dark:border-white/15 dark:bg-white/[0.04]">
                      <Check className="h-3 w-3 text-[#0a0a0a] dark:text-white" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/[0.02] px-8 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -z-0 h-72 w-[480px] -translate-x-1/2 rounded-full bg-black/[0.04] blur-[110px] dark:bg-white/[0.07]"
            />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#0a0a0a] sm:text-4xl dark:text-white">
                Ready to create your first invoice?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-black/60 dark:text-white/55">
                Start now, no signup required. Save your work by creating an
                account anytime.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/invoices/create"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-8 py-4 font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-[#0a0a0a]"
                >
                  Create an invoice
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer (Ft2 inline-ish, real links only) ─────────────── */}
      <footer className="relative border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col justify-between gap-10 sm:flex-row">
            <div className="max-w-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0a0a0a] dark:text-white" />
                <span className="font-semibold text-[#0a0a0a] dark:text-white">
                  Invoicer
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-black/45 dark:text-white/45">
                Professional invoices in minutes. Free to start, no signup.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                  Product
                </p>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link href="/invoices/create" className="text-black/65 transition-colors hover:text-[#0a0a0a] dark:text-white/65 dark:hover:text-white">
                      Create invoice
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-black/65 transition-colors hover:text-[#0a0a0a] dark:text-white/65 dark:hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/invoices" className="text-black/65 transition-colors hover:text-[#0a0a0a] dark:text-white/65 dark:hover:text-white">
                      Invoices
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                  Account
                </p>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link href="/sign-in" className="text-black/65 transition-colors hover:text-[#0a0a0a] dark:text-white/65 dark:hover:text-white">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/sign-up" className="text-black/65 transition-colors hover:text-[#0a0a0a] dark:text-white/65 dark:hover:text-white">
                      Sign up
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 border-t border-black/10 pt-6 dark:border-white/10">
            <Globe className="h-3.5 w-3.5 text-black/40 dark:text-white/40" />
            <p className="text-sm text-black/40 dark:text-white/40">
              © 2026 Invoicer. Simple invoicing for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
