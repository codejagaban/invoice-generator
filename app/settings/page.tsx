"use client";

/**
 * Settings Page
 * App-wide settings like default currency
 */

import { useEffect, useState } from "react";
import { useDbReady } from "@/app/components/DbScopeProvider";
import Button from "@/app/components/shared/Button";
import Card from "@/app/components/shared/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shared/Select";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/app/lib/storage";
import { Save } from "lucide-react";

const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "INR", label: "Indian Rupee" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "NGN", label: "Nigerian Naira" },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CHF: "Fr",
  CNY: "¥",
  INR: "₹",
  MXN: "MX$",
  NGN: "₦",
};

const getCurrencySymbol = (currencyCode: string): string => {
  const mappedSymbol = CURRENCY_SYMBOLS[currencyCode];
  if (mappedSymbol) return mappedSymbol;

  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    const symbol = parts.find((part) => part.type === "currency")?.value;
    if (!symbol || symbol === currencyCode) return "¤";
    return symbol;
  } catch {
    return "¤";
  }
};

export default function SettingsPage() {
  const dbReady = useDbReady();
  const [defaultCurrency, setDefaultCurrency] = useState("GBP");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const settings = await getSettings();
      setDefaultCurrency(settings.defaultCurrency);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings({
      defaultCurrency,
      updatedAt: new Date().toISOString(),
    });
    setIsSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-(--muted)">
            App preferences and defaults
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {isLoading ? (
          <p className="text-(--muted)">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Default Currency */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 shrink-0 text-lg font-semibold">
                  {getCurrencySymbol(defaultCurrency)}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-black dark:text-white">
                    Default Currency
                  </h3>
                  <p className="text-xs text-(--muted) mt-0.5 mb-3">
                    Used as the default when creating new invoices and for
                    dashboard conversions.
                  </p>
                  <div className="flex items-center gap-3">
                    <Select
                      value={defaultCurrency}
                      onValueChange={setDefaultCurrency}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.label} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
