"use client";

/**
 * Customers Page
 * Route: /customers
 */

import { useEffect, useRef, useState } from "react";
import { useDbReady } from "@/app/components/DbScopeProvider";
import {
  User,
  Mail,
  MapPin,
  Map,
  Hash,
  Globe,
  ImagePlus,
  UserPlus,
  UserCheck,
  X,
  Pencil,
  Trash2,
  Search,
  Settings2,
} from "lucide-react";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shared/Select";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { Customer } from "@/app/lib/types";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/lib/storage";
import { CustomerListSkeleton } from "@/app/components/shared/Skeleton";
import EmptyState from "@/app/components/shared/EmptyState";
import { Users } from "lucide-react";
import { useConfirm } from "@/app/components/shared/ConfirmDialog";

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus",
  "Belgium", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia",
  "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece",
  "Guatemala", "Honduras", "Hong Kong", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon",
  "Libya", "Lithuania", "Luxembourg", "Malaysia", "Malta", "Mexico",
  "Moldova", "Morocco", "Mozambique", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Nigeria", "North Korea", "Norway", "Oman",
  "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal",
  "Serbia", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey",
  "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

export default function CustomersPage() {
  const [confirm, ConfirmDialogUI] = useConfirm();
  const dbReady = useDbReady();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [logoError, setLogoError] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United Kingdom",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload a valid image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Convert SVG to PNG for html2canvas/PDF compatibility
      if (file.type === "image/svg+xml") {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 200;
          canvas.height = img.naturalHeight || 200;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          setLogo(canvas.toDataURL("image/png"));
          setLogoError(undefined);
        };
        img.onerror = () => {
          setLogoError("Failed to process SVG image");
        };
        img.src = dataUrl;
      } else {
        setLogo(dataUrl);
        setLogoError(undefined);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const data = await getCustomers();
      setCustomers(data);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setLogo(undefined);
    setLogoError(undefined);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormData({
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United Kingdom",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear this field's error as the user types
    if (errors[name]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setShowForm(true);
    setLogo(customer.logo);
    setLogoError(undefined);
    setFormData({
      name: customer.name,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      country: customer.country,
    });
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ description: "Are you sure you want to delete this customer?", variant: "danger", confirmLabel: "Delete" }))) return;
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (editingId) {
      const updated = await updateCustomer(editingId, { ...formData, logo });
      if (updated) {
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === editingId ? updated : customer,
          ),
        );
      }
    } else {
      const newCustomer: Customer = {
        id: String(Date.now()),
        ...formData,
        logo,
      };
      const created = await createCustomer(newCustomer);
      setCustomers((prev) => [...prev, created]);
    }

    resetForm();
  };

  const filteredCustomers = searchTerm
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : customers;

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Customers</h1>
              <p className="mt-1 text-sm text-(--muted)">{customers.length} customer{customers.length !== 1 ? "s" : ""}</p>
            </div>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <UserPlus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {isLoading ? (
          <CustomerListSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Search */}
            <Input
              type="text"
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leadingIcon={<Search className="h-4 w-4" />}
              className="max-w-sm"
            />

            {/* Table */}
            {filteredCustomers.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Users}
                  title={searchTerm ? "No customers found" : "No customers yet"}
                  description={searchTerm ? "Try a different search term." : "Add your first customer to get started."}
                >
                  {!searchTerm && (
                    <Button onClick={() => { resetForm(); setShowForm(true); }}>
                      <UserPlus className="h-4 w-4" />
                      Add Customer
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
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Customer</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Email</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted) hidden md:table-cell">Address</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted) hidden lg:table-cell">Country</th>
                        <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-(--muted) w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border)">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="transition-colors hover:bg-(--border)/20">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {customer.logo ? (
                                <img
                                  src={customer.logo}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-contain border border-(--border) bg-(--surface-raised) shrink-0"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 shrink-0">
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-black dark:text-white">{customer.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-(--muted)">{customer.email}</td>
                          <td className="px-5 py-3.5 text-(--muted) hidden md:table-cell max-w-50 truncate">
                            {[customer.address, customer.city, customer.state, customer.zipCode].filter(Boolean).join(", ")}
                          </td>
                          <td className="px-5 py-3.5 text-(--muted) hidden lg:table-cell">{customer.country}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEdit(customer)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-(--muted) hover:bg-(--surface) hover:text-black dark:hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(customer.id)}
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

      {/* ── Add/Edit Customer Modal ─────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-(--border) bg-white dark:bg-[#1a1a1a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {editingId ? "Edit Customer" : "Add Customer"}
              </h2>
              <button onClick={resetForm} className="text-(--muted) hover:text-black dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-medium text-(--muted) mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {logo ? (
                    <div className="relative shrink-0">
                      <img src={logo} alt="" className="h-12 w-12 rounded-full object-contain border border-(--border) bg-(--surface-raised)" />
                      <button type="button" onClick={removeLogo} className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-(--border) bg-(--surface-raised) text-(--muted)">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="customer-logo-upload" />
                    <label htmlFor="customer-logo-upload" className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-black dark:text-white hover:underline">
                      <ImagePlus className="h-3.5 w-3.5" />
                      {logo ? "Change" : "Upload"}
                    </label>
                    {logoError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{logoError}</p>}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" value={formData.name} onChange={handleInputChange} leadingIcon={<User className="h-4 w-4" />} error={errors.name} required />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} leadingIcon={<Mail className="h-4 w-4" />} error={errors.email} required />
              </div>
              <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} leadingIcon={<MapPin className="h-4 w-4" />} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="City" name="city" value={formData.city} onChange={handleInputChange} leadingIcon={<Map className="h-4 w-4" />} />
                <Input label="State" name="state" value={formData.state} onChange={handleInputChange} leadingIcon={<Map className="h-4 w-4" />} />
                <Input label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} leadingIcon={<Hash className="h-4 w-4" />} />
              </div>
              <div>
                <label className="block text-xs font-medium text-(--muted) mb-1">Country</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"><Globe className="h-4 w-4" /></span>
                  <Select value={formData.country} onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}>
                    <SelectTrigger className="pl-9"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (<SelectItem key={country} value={country}>{country}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                <Button type="submit">
                  {editingId ? (<><UserCheck className="h-4 w-4" /> Update</>) : (<><UserPlus className="h-4 w-4" /> Add Customer</>)}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialogUI />
    </div>
  );
}
