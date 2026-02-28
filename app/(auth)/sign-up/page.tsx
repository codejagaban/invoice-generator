"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/app/components/shared/Button";
import Input from "@/app/components/shared/Input";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
      setIsLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      router.push("/sign-in");
      return;
    }
    router.push("/invoices");
  }

  return (
    <div className="min-h-screen bg-(--background) flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <span className="text-xl font-bold text-black dark:text-white">
            Invoice
          </span>
          <span className="text-xl font-light text-(--muted)">Generator</span>
        </Link>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-1">
            Create an account
          </h1>
          <p className="text-sm text-(--muted) mb-6">
            Free forever. No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="At least 8 characters."
              required
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-(--muted)">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-black underline-offset-4 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
