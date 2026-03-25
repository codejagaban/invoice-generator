"use client";

/**
 * Company Page
 * Manage company/freelancer profiles
 */

import { useEffect, useState } from "react";
import { useDbReady } from "@/app/components/DbScopeProvider";
import Button from "@/app/components/shared/Button";
import Card from "@/app/components/shared/Card";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import CompanyForm from "@/app/components/CompanyForm";
import type { CompanyDetails } from "@/app/lib/types";
import {
  Pencil,
  Trash2,
  Star,
  Building2,
  Search,
  Plus,
  X,
  Mail,
  Phone,
  Globe,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useConfirm } from "@/app/components/shared/ConfirmDialog";
import {
  getCompanyDetails,
  createCompany,
  updateCompany,
  deleteCompany,
  setDefaultCompany,
} from "@/app/lib/storage";
import EmptyState from "@/app/components/shared/EmptyState";

export default function CompanyPage() {
  const [confirm, ConfirmDialogUI] = useConfirm();
  const dbReady = useDbReady();
  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<CompanyDetails | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const data = await getCompanyDetails();
      setCompanies(data);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const handleSubmit = async (company: CompanyDetails) => {
    if (editingId) {
      const updated = await updateCompany(editingId, company);
      if (updated) {
        setCompanies((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      }
    } else {
      const created = await createCompany(company);
      setCompanies((prev) => [...prev, created]);
    }
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ description: "Are you sure you want to delete this company profile?", variant: "danger", confirmLabel: "Delete" })) {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSetDefault = async (id: string) => {
    if (await setDefaultCompany(id)) {
      setCompanies((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
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

  const filteredCompanies = searchTerm
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : companies;

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Companies</h1>
              <p className="mt-1 text-sm text-(--muted)">{companies.length} compan{companies.length !== 1 ? "ies" : "y"}</p>
            </div>
            <Button onClick={() => { handleCancel(); setShowForm(true); }}>
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {isLoading ? (
          <p className="text-(--muted)">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Search */}
            <Input
              type="text"
              placeholder="Search company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leadingIcon={<Search className="h-4 w-4" />}
              className="max-w-sm"
            />

            {/* Table */}
            {filteredCompanies.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Building2}
                  title={searchTerm ? "No companies found" : "No company profiles yet"}
                  description={searchTerm ? "Try a different search term." : "Add your company details to get started."}
                >
                  {!searchTerm && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4" />
                      Add Company
                    </Button>
                  )}
                </EmptyState>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0!">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-(--border) bg-(--surface)">
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Company</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Email</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted) hidden md:table-cell">Phone</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted) hidden lg:table-cell">Address</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted) hidden lg:table-cell">Country</th>
                        <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-(--muted) w-28"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border)">
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="transition-colors hover:bg-(--border)/20">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {company.logo ? (
                                <Image
                                  src={company.logo}
                                  alt=""
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 rounded-full object-contain border border-(--border) bg-(--surface-raised) shrink-0"
                                  style={{ objectFit: "contain" }}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 shrink-0">
                                  {company.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-black dark:text-white">{company.name}</span>
                                {company.isDefault && (
                                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Star className="h-2.5 w-2.5" /> Default
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-(--muted)">{company.email}</td>
                          <td className="px-5 py-3.5 text-(--muted) hidden md:table-cell">{company.phone || "—"}</td>
                          <td className="px-5 py-3.5 text-(--muted) hidden lg:table-cell max-w-50 truncate">
                            {[company.address, company.city, company.state].filter(Boolean).join(", ")}
                          </td>
                          <td className="px-5 py-3.5 text-(--muted) hidden lg:table-cell">{company.country}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!company.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(company.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-(--muted) hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-950/20 dark:hover:text-yellow-400 transition-colors"
                                  title="Set as default"
                                >
                                  <Star className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(company)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-(--muted) hover:bg-(--surface) hover:text-black dark:hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(company.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-(--muted) hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* ── Add/Edit Company Modal ──────────────────────────── */}
      <AnimatePresence>
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[3px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-(--border) bg-white dark:bg-[#1a1a1a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {editingId ? "Edit Company" : "Add Company"}
              </h2>
              <button onClick={handleCancel} className="text-(--muted) hover:text-black dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <CompanyForm
                initialData={editingData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <ConfirmDialogUI />
    </div>
  );
}
