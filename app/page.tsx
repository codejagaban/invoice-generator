import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto max-w-7xl px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Invoice Generator
          </h1>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Hero Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
                Create Professional Invoices
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Simple, fast invoice creation for small businesses and
                freelancers. No unnecessary complexity.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/invoices/create"
                className="rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                Create Invoice
              </Link>
              <Link
                href="/invoices"
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-black transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900"
              >
                View Invoices
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="mt-16 space-y-8">
            <h3 className="text-2xl font-bold text-black dark:text-white">
              Features
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Quick Creation",
                  description:
                    "Create invoices in minutes with our intuitive form",
                },
                {
                  title: "PDF Export",
                  description:
                    "Generate professional PDF versions of your invoices",
                },
                {
                  title: "Templates",
                  description:
                    "Save templates for faster recurring invoice creation",
                },
                {
                  title: "Easy Management",
                  description: "Organize, filter, and search your invoices",
                },
                {
                  title: "Email Integration",
                  description: "Send invoices directly to your clients",
                },
                {
                  title: "Responsive Design",
                  description: "Works seamlessly on desktop and mobile devices",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900"
                >
                  <h4 className="font-semibold text-black dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-16 rounded-lg bg-gray-100 p-8 dark:bg-gray-900 sm:p-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-black dark:text-white">
                Ready to create your first invoice?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get started now with our simple invoice generator. No signup
                required.
              </p>
              <div className="pt-4">
                <Link
                  href="/invoices/create"
                  className="inline-block rounded-lg bg-black px-8 py-3 font-medium text-white transition-colors hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                  Create Your First Invoice
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2026 Invoice Generator. Simple invoicing for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
