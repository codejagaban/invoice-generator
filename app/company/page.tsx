"use client";

/**
 * Company Settings Page
 * Manage company/freelancer details
 */

import { useEffect, useState } from "react";
import { useDbReady } from "@/app/components/DbScopeProvider";
import Button from "@/app/components/shared/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import CompanyForm from "@/app/components/CompanyForm";
import type { CompanyDetails } from "@/app/lib/types";
import { Pencil, Trash2, Star } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shared/Select";
import { useConfirm } from "@/app/components/shared/ConfirmDialog";
import {
  getCompanyDetails,
  createCompany,
  updateCompany,
  deleteCompany,
  setDefaultCompany,
  getSettings,
  saveSettings,
} from "@/app/lib/storage";

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

export default function CompanyPage() {
  const [confirm, ConfirmDialogUI] = useConfirm();
  const dbReady = useDbReady();
  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<CompanyDetails | undefined>();
  const [defaultCurrency, setDefaultCurrency] = useState("GBP");
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencySaved, setCurrencySaved] = useState(false);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const [companies, settings] = await Promise.all([
        getCompanyDetails(),
        getSettings(),
      ]);
      setCompanies(companies);
      setDefaultCurrency(settings.defaultCurrency);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const handleSaveCurrency = async () => {
    setIsSavingCurrency(true);
    await saveSettings({ defaultCurrency });
    setIsSavingCurrency(false);
    setCurrencySaved(true);
    setTimeout(() => setCurrencySaved(false), 2000);
  };

  const handleSubmit = async (company: CompanyDetails) => {
    if (editingId) {
      const updated = await updateCompany(editingId, company);
      if (updated) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c)),
        );
      }
    } else {
      const created = await createCompany(company);
      setCompanies((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditingId(null);
    setEditingData(undefined);
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ description: "Are you sure you want to delete this company profile?", variant: "danger", confirmLabel: "Delete" })) {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSetDefault = async (id: string) => {
    if (await setDefaultCompany(id)) {
      setCompanies((prev) =>
        prev.map((c) => ({
          ...c,
          isDefault: c.id === id,
        })),
      );
    }
  };

  const handleEdit = (company: CompanyDetails) => {
    setEditingId(company.id);
    setEditingData(company);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingData(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--background) p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-(--muted)">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background) p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Company Settings
          </h1>
          <p className="text-(--muted)">
            Manage your company or freelancing details
          </p>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8">
            <CompanyForm
              initialData={editingData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Default Currency */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Default Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-(--muted)">
              Used as the default currency when creating new invoices.
            </p>
            <div className="flex items-center gap-3">
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSaveCurrency} disabled={isSavingCurrency}>
                {currencySaved ? "Saved!" : isSavingCurrency ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <div className="space-y-4">
          {companies.length === 0 && !showForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--muted) mb-4">
                  No company profiles yet. Create one to get started.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  + Add Company Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {!showForm && (
                <div className="mb-6">
                  <Button onClick={() => setShowForm(true)}>
                    + Add Company Profile
                  </Button>
                </div>
              )}

              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {company.logo && (
                          <Image
                            src={company.logo}
                            alt={`${company.name} logo`}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-contain border border-(--border) bg-(--surface-raised) p-1 shrink-0"
                            style={{ objectFit: "contain" }}
                            priority
                          />
                        )}
                        <div>
                          <CardTitle>{company.name}</CardTitle>
                          <p className="text-sm text-(--muted) mt-1">
                            {company.email}
                          </p>
                        </div>
                      </div>
                      {company.isDefault && (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-(--muted)">Phone</p>
                        <p className="text-black dark:text-white">
                          {company.phone || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-(--muted)">Website</p>
                        <p className="text-black dark:text-white truncate">
                          {company.website || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-(--muted)">Address</p>
                        <p className="text-black dark:text-white">
                          {company.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-(--muted)">Tax ID</p>
                        <p className="text-black dark:text-white">
                          {company.taxId || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-(--muted)">City</p>
                        <p className="text-black dark:text-white">
                          {company.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-(--muted)">Country</p>
                        <p className="text-black dark:text-white">
                          {company.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 pt-4 border-t border-(--border)">
                      {!company.isDefault && companies.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-9 px-0"
                          onClick={() => handleSetDefault(company.id)}
                          title="Set as Default"
                          aria-label="Set as default company"
                        >
                          <Star className="h-4 w-4 text-yellow-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-9 px-0"
                        onClick={() => handleEdit(company)}
                        aria-label="Edit company"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-9 px-0"
                        onClick={() => handleDelete(company.id)}
                        aria-label="Delete company"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
      <ConfirmDialogUI />
    </div>
  );
}
