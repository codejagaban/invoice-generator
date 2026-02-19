import Link from "next/link";

const features = [
  {
    title: "Quick Creation",
    description:
      "Build polished invoices in under 2 minutes with our streamlined form — no accounting background needed.",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg:
      "bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:ring-violet-800",
    hoverBg:
      "hover:bg-linear-to-br hover:from-white hover:to-violet-50/50 hover:border-violet-100 dark:hover:from-[#1a1a1a] dark:hover:to-violet-900/20 dark:hover:border-violet-800",
    glow: "bg-violet-400 dark:bg-violet-500",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "PDF Export",
    description:
      "Generate pixel-perfect, client-ready PDFs with a single click — ready to share or archive.",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg:
      "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:ring-blue-800",
    hoverBg:
      "hover:bg-linear-to-br hover:from-white hover:to-blue-50/50 hover:border-blue-100 dark:hover:from-[#1a1a1a] dark:hover:to-blue-900/20 dark:hover:border-blue-800",
    glow: "bg-blue-400 dark:bg-blue-500",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 10v6m0 0-3-3m3 3 3-3M3 17V7a2 2 0 0 1 2-2h6l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Smart Templates",
    description:
      "Save your frequently-used invoice layouts as templates and launch recurring invoices in seconds.",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg:
      "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800",
    hoverBg:
      "hover:bg-linear-to-br hover:from-white hover:to-emerald-50/50 hover:border-emerald-100 dark:hover:from-[#1a1a1a] dark:hover:to-emerald-900/20 dark:hover:border-emerald-800",
    glow: "bg-emerald-400 dark:bg-emerald-500",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
        />
      </svg>
    ),
  },
  {
    title: "Email Integration",
    description:
      "Send invoices straight to your clients' inboxes without ever leaving the app.",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg:
      "bg-rose-50 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:ring-rose-800",
    hoverBg:
      "hover:bg-linear-to-br hover:from-white hover:to-rose-50/50 hover:border-rose-100 dark:hover:from-[#1a1a1a] dark:hover:to-rose-900/20 dark:hover:border-rose-800",
    glow: "bg-rose-400 dark:bg-rose-500",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
];

const stats = [
  {
    value: "2 min",
    label: "Average creation time",
    gradient: "from-orange-500 to-rose-500",
  },
  {
    value: "100%",
    label: "Free to use",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    value: "0",
    label: "Sign-ups required",
    gradient: "from-blue-500 to-indigo-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <section className="px-8 py-16 text-center sm:px-12 sm:py-24">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
              No sign-up required · Free forever
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white sm:text-6xl">
              Invoicing that{" "}
              <span className="bg-linear-to-r from-orange-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                just works
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-relaxed text-(--muted)">
              Create, send, and manage professional invoices in minutes. Built
              for freelancers and small businesses who want power without the
              complexity.
            </p>

            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              <Link
                href="/invoices/create"
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-gray-800 via-gray-900 to-black px-8 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition-all hover:scale-105 hover:shadow-black/30 dark:from-white dark:via-gray-100 dark:to-gray-200 dark:text-black dark:shadow-white/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Invoice
              </Link>
              <Link
                href="/invoices"
                className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-linear-to-br from-gray-50 to-gray-100 px-8 py-3.5 font-semibold text-black transition-all hover:scale-105 hover:border-black/25 hover:shadow-md dark:border-white/15 dark:from-white/5 dark:to-white/10 dark:text-white dark:hover:border-white/25"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="mt-8 grid grid-cols-3 divide-x rounded-xl border border-(--border) divide-(--border) bg-white shadow-sm dark:bg-[#111]">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center">
              <p
                className={`bg-linear-to-r ${stat.gradient} bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl`}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-(--muted) sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* Features Section */}
        <section className="mt-20 space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
              Everything you need to get paid
            </h2>
            <p className="mt-3 text-base text-(--muted)">
              All the essentials — none of the bloat.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative flex min-h-72 flex-col overflow-hidden rounded-2xl border border-(--border) bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-(--surface-raised) ${feature.hoverBg}`}
              >
                {/* Blurred glow blob */}
                <div
                  className={`pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08] ${feature.glow}`}
                />
                <div
                  className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.iconColor} ${feature.iconBg}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-base leading-relaxed text-(--muted)">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative mt-20 overflow-hidden rounded-2xl border border-(--border) bg-(--surface-raised) p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-black/5 blur-3xl dark:bg-white/5" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-black/5 blur-3xl dark:bg-white/5" />
          <div className="relative z-10 mx-auto max-w-xl space-y-4">
            <h3 className="text-2xl font-extrabold text-black dark:text-white sm:text-3xl">
              Ready to get paid faster?
            </h3>
            <p className="text-(--muted)">
              Join thousands of freelancers and small businesses who send
              professional invoices in minutes.
            </p>
            <div className="pt-2">
              <Link
                href="/invoices/create"
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-gray-800 via-gray-900 to-black px-8 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition-all hover:scale-105 hover:shadow-black/30 dark:from-white dark:via-gray-100 dark:to-gray-200 dark:text-black dark:shadow-white/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Invoice
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-(--muted)">
            © 2026 Invoice Generator. Simple invoicing for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
