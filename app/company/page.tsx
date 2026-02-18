"use client";

/**
 * Company Settings Page
 * Manage company/freelancer details
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/app/components/shared/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import CompanyForm from "@/app/components/CompanyForm";
import type { CompanyDetails } from "@/app/lib/types";
import {
  getCompanyDetails,
  createCompany,
  updateCompany,
  deleteCompany,
  setDefaultCompany,
} from "@/app/lib/storage";

export default function CompanyPage() {
  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<CompanyDetails | undefined>();

  useEffect(() => {
    // Load companies
    const companies = getCompanyDetails();
    setCompanies(companies);
    setIsLoading(false);
  }, []);

  const handleSubmit = async (company: CompanyDetails) => {
    if (editingId) {
      const updated = updateCompany(editingId, company);
      if (updated) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c)),
        );
      }
    } else {
      const created = createCompany(company);
      setCompanies((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditingId(null);
    setEditingData(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this company profile?")) {
      deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    if (setDefaultCompany(id)) {
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
      <div className="min-h-screen bg-white dark:bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 mb-4 inline-block hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Company Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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

        {/* Companies List */}
        <div className="space-y-4">
          {companies.length === 0 && !showForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{company.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {company.email}
                        </p>
                      </div>
                      {company.isDefault && (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Phone
                        </p>
                        <p className="text-black dark:text-white">
                          {company.phone || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Website
                        </p>
                        <p className="text-black dark:text-white truncate">
                          {company.website || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Address
                        </p>
                        <p className="text-black dark:text-white">
                          {company.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Tax ID
                        </p>
                        <p className="text-black dark:text-white">
                          {company.taxId || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">City</p>
                        <p className="text-black dark:text-white">
                          {company.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Country
                        </p>
                        <p className="text-black dark:text-white">
                          {company.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                      {!company.isDefault && companies.length > 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetDefault(company.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(company)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(company.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
