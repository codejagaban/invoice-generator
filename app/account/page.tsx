"use client";

/**
 * Account Details Page
 * Manage bank / payment account details shown on invoices
 */

import { useEffect, useState } from "react";
import { useDbReady } from "@/app/components/DbScopeProvider";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import Textarea from "@/app/components/shared/Textarea";
import Button from "@/app/components/shared/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { AccountDetails } from "@/app/lib/types";
import { Pencil, Trash2, Star } from "lucide-react";
import {
  getAccountDetails,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount,
} from "@/app/lib/storage";
import { useConfirm } from "@/app/components/shared/ConfirmDialog";

const emptyForm = {
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  sortCode: "",
  routingNumber: "",
  iban: "",
  swiftBic: "",
  currency: "",
  paymentReference: "",
  notes: "",
  isDefault: false,
};

export default function AccountPage() {
  const [confirm, ConfirmDialogUI] = useConfirm();
  const dbReady = useDbReady();
  const [accounts, setAccounts] = useState<AccountDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      setAccounts(await getAccountDetails());
      setIsLoading(false);
    })();
  }, [dbReady]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.accountHolderName.trim())
      newErrors.accountHolderName = "Account holder name is required";
    if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required";
    if (!formData.accountNumber.trim())
      newErrors.accountNumber = "Account number is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      const updated = await updateAccount(editingId, { ...formData, updatedAt: now });
      if (updated) {
        setAccounts((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      }
    } else {
      const created = await createAccount({
        id: String(Date.now()),
        ...formData,
        createdAt: now,
        updatedAt: now,
      });
      setAccounts((prev) => [...prev, created]);
    }

    handleCancel();
  };

  const handleEdit = (account: AccountDetails) => {
    setEditingId(account.id);
    setFormData({
      accountHolderName: account.accountHolderName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      sortCode: account.sortCode ?? "",
      routingNumber: account.routingNumber ?? "",
      iban: account.iban ?? "",
      swiftBic: account.swiftBic ?? "",
      currency: account.currency ?? "",
      paymentReference: account.paymentReference ?? "",
      notes: account.notes ?? "",
      isDefault: account.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ description: "Delete this account profile?", variant: "danger", confirmLabel: "Delete" }))) return;
    await deleteAccount(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    if (await setDefaultAccount(id)) {
      setAccounts((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setErrors({});
    setFormData(emptyForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--background) p-6">
        <p className="text-(--muted)">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background) p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Account Details
          </h1>
          <p className="text-(--muted)">
            Add your bank account information so clients know where to send payment.
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingId ? "Edit" : "Add"} Account Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Account Holder Name"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleInputChange}
                      error={errors.accountHolderName}
                      required
                    />
                    <Input
                      label="Bank Name"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      error={errors.bankName}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Account Number"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      error={errors.accountNumber}
                      required
                    />
                    <Input
                      label="Sort Code (optional)"
                      name="sortCode"
                      value={formData.sortCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Routing Number (optional)"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Currency (optional)"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      placeholder="e.g. GBP, USD, EUR"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="IBAN (optional)"
                      name="iban"
                      value={formData.iban}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="SWIFT / BIC (optional)"
                      name="swiftBic"
                      value={formData.swiftBic}
                      onChange={handleInputChange}
                    />
                  </div>

                  <Input
                    label="Payment Reference (optional)"
                    name="paymentReference"
                    value={formData.paymentReference}
                    onChange={handleInputChange}
                    placeholder="e.g. Please quote invoice number"
                  />

                  <Textarea
                    label="Notes (optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional payment instructions..."
                    rows={3}
                  />

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="rounded border-(--border)"
                    />
                    <span className="text-(--muted)">Set as default account</span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit">
                      {editingId ? "Update Account" : "Save Account"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accounts list */}
        <div className="space-y-4">
          {accounts.length === 0 && !showForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--muted) mb-4">
                  No account profiles yet. Add one to include payment details on your invoices.
                </p>
                <Button onClick={() => setShowForm(true)}>+ Add Account</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {!showForm && (
                <div className="mb-6">
                  <Button onClick={() => setShowForm(true)}>+ Add Account</Button>
                </div>
              )}

              {accounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle>{account.accountHolderName}</CardTitle>
                        <p className="text-sm text-(--muted) mt-1">{account.bankName}</p>
                      </div>
                      {account.isDefault && (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-(--muted)">Account Number</p>
                        <p className="text-black dark:text-white">{account.accountNumber}</p>
                      </div>
                      {account.sortCode && (
                        <div>
                          <p className="text-(--muted)">Sort Code</p>
                          <p className="text-black dark:text-white">{account.sortCode}</p>
                        </div>
                      )}
                      {account.routingNumber && (
                        <div>
                          <p className="text-(--muted)">Routing Number</p>
                          <p className="text-black dark:text-white">{account.routingNumber}</p>
                        </div>
                      )}
                      {account.iban && (
                        <div>
                          <p className="text-(--muted)">IBAN</p>
                          <p className="text-black dark:text-white font-mono text-xs">{account.iban}</p>
                        </div>
                      )}
                      {account.swiftBic && (
                        <div>
                          <p className="text-(--muted)">SWIFT / BIC</p>
                          <p className="text-black dark:text-white">{account.swiftBic}</p>
                        </div>
                      )}
                      {account.currency && (
                        <div>
                          <p className="text-(--muted)">Currency</p>
                          <p className="text-black dark:text-white">{account.currency}</p>
                        </div>
                      )}
                      {account.paymentReference && (
                        <div className="sm:col-span-2">
                          <p className="text-(--muted)">Payment Reference</p>
                          <p className="text-black dark:text-white">{account.paymentReference}</p>
                        </div>
                      )}
                      {account.notes && (
                        <div className="sm:col-span-2">
                          <p className="text-(--muted)">Notes</p>
                          <p className="text-black dark:text-white text-sm">{account.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 pt-4 border-t border-(--border)">
                      {!account.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-9 px-0"
                          onClick={() => handleSetDefault(account.id)}
                          title="Set as Default"
                          aria-label="Set as default account"
                        >
                          <Star className="h-4 w-4 text-yellow-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-9 px-0"
                        onClick={() => handleEdit(account)}
                        aria-label="Edit account"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-9 px-0"
                        onClick={() => handleDelete(account.id)}
                        aria-label="Delete account"
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
