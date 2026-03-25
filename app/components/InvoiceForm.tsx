"use client";
import { toast } from "sonner";

/**
 * Invoice Form Component
 * Client-side form for creating and editing invoices
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import Textarea from "@/app/components/shared/Textarea";
import DatePicker from "@/app/components/shared/DatePicker";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/app/components/shared/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shared/Select";
import type {
  Invoice,
  InvoiceItem,
  Customer,
  CompanyDetails,
  AccountDetails,
  InvoiceTemplate,
} from "@/app/lib/types";
import {
  Building2,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Hash,
  BookmarkPlus,
  Mail,
  Map,
  MapPin,
  Plus,
  CheckCircle2,
  Trash2,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import { validateInvoiceForm } from "@/app/lib/validation";
import {
  calculateInvoiceSummary,
  generateInvoiceNumber,
  formatCurrency,
} from "@/app/lib/invoice";
import {
  createTemplate,
  getCustomers,
  getCompanyDetails,
  getSettings,
  getAccountDetails,
} from "@/app/lib/storage";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { useDbReady } from "@/app/components/DbScopeProvider";

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Malta",
  "Mexico",
  "Moldova",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Somalia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tanzania",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

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

interface InvoiceFormProps {
  initialData?: Invoice;
  onSubmit: (data: Invoice) => Promise<void>;
}

const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

export default function InvoiceForm({
  initialData,
  onSubmit,
}: InvoiceFormProps) {
  const { data: session } = useSession();
  const isGuest = !session;
  const dbReady = useDbReady();
  const [isLoading, setIsLoading] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(
    !!(
      initialData?.company?.address ||
      initialData?.company?.phone ||
      initialData?.company?.taxId
    ),
  );
  const [showCustomerDetails, setShowCustomerDetails] = useState(
    !!(initialData?.customer.address || initialData?.customer.city),
  );
  const [showTaxDiscount, setShowTaxDiscount] = useState(
    !!(initialData?.taxRate || initialData?.discountValue),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [accounts, setAccounts] = useState<AccountDetails[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    initialData?.accountId || "",
  );

  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    date: initialData?.date || toLocalDateString(new Date()),
    dueDate:
      initialData?.dueDate ||
      toLocalDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    customerName: initialData?.customer.name || "",
    customerEmail: initialData?.customer.email || "",
    customerAddress: initialData?.customer.address || "",
    customerCity: initialData?.customer.city || "",
    customerState: initialData?.customer.state || "",
    customerZipCode: initialData?.customer.zipCode || "",
    customerCountry: initialData?.customer.country || "United Kingdom",
    customerLogo: initialData?.customer.logo || "",
    companyName: initialData?.company?.name || "",
    companyEmail: initialData?.company?.email || "",
    companyPhone: initialData?.company?.phone || "",
    companyAddress: initialData?.company?.address || "",
    companyCity: initialData?.company?.city || "",
    companyState: initialData?.company?.state || "",
    companyZipCode: initialData?.company?.zipCode || "",
    companyCountry: initialData?.company?.country || "",
    companyLogo: initialData?.company?.logo || "",
    companyTaxId: initialData?.company?.taxId || "",
    currency: initialData?.currency || "GBP",
    notes: initialData?.notes || "",
    taxRate: initialData?.taxRate || 0,
    discountType: initialData?.discountType || ("percentage" as const),
    discountValue: initialData?.discountValue || 0,
  });

  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items || [
      {
        id: "1",
        description: "",
        quantity: 1,
        rate: 0,
      },
    ],
  );
  const [templateId, setTemplateId] = useState<string | undefined>(
    initialData?.templateId,
  );

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const [storedCustomers, storedCompanies, storedAccounts, settings] =
        await Promise.all([
          getCustomers(),
          getCompanyDetails(),
          getAccountDetails(),
          getSettings(),
        ]);
      setCustomers(storedCustomers);
      setCompanies(storedCompanies);
      setAccounts(storedAccounts);
      if (!initialData && storedAccounts.length > 0) {
        const defaultAccount = storedAccounts.find((a) => a.isDefault);
        if (defaultAccount) setSelectedAccountId(defaultAccount.id);
      }
      if (!initialData) {
        setFormData((prev) => ({
          ...prev,
          currency: settings.defaultCurrency,
        }));
        // Auto-select default company
        const defaultCompany = storedCompanies.find((c) => c.isDefault);
        if (defaultCompany) {
          setSelectedCompanyId(defaultCompany.id);
          setFormData((prev) => ({
            ...prev,
            companyName: defaultCompany.name,
            companyEmail: defaultCompany.email,
            companyPhone: defaultCompany.phone || "",
            companyAddress: defaultCompany.address,
            companyCity: defaultCompany.city,
            companyState: defaultCompany.state,
            companyZipCode: defaultCompany.zipCode,
            companyCountry: defaultCompany.country,
            companyLogo: defaultCompany.logo || "",
            companyTaxId: defaultCompany.taxId || "",
          }));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbReady]);

  // Load template from sessionStorage on mount
  useEffect(() => {
    const selectedTemplate = sessionStorage.getItem("selectedTemplate");
    if (selectedTemplate && !initialData) {
      try {
        const template: InvoiceTemplate = JSON.parse(selectedTemplate);

        // Populate form with template data
        setFormData((prev) => ({
          ...prev,
          customerName: template.customer.name || "",
          customerEmail: template.customer.email || "",
          customerAddress: template.customer.address || "",
          customerCity: template.customer.city || "",
          customerState: template.customer.state || "",
          customerZipCode: template.customer.zipCode || "",
          customerCountry: template.customer.country || "",
          customerLogo: template.customer.logo || "",
          companyName: template.company?.name || prev.companyName,
          companyEmail: template.company?.email || prev.companyEmail,
          companyPhone: template.company?.phone || prev.companyPhone,
          companyAddress: template.company?.address || prev.companyAddress,
          companyCity: template.company?.city || prev.companyCity,
          companyState: template.company?.state || prev.companyState,
          companyZipCode: template.company?.zipCode || prev.companyZipCode,
          companyCountry: template.company?.country || prev.companyCountry,
          companyLogo: template.company?.logo || prev.companyLogo,
          companyTaxId: template.company?.taxId || prev.companyTaxId,
          currency: template.currency,
          notes: template.notes || "",
          taxRate: template.taxRate || 0,
        }));

        // Restore account selection
        if (template.accountId) {
          setSelectedAccountId(template.accountId);
        }

        // Populate items
        if (template.items && template.items.length > 0) {
          const populatedItems = template.items.map((item, index) => ({
            id: String(index + 1),
            description: item.description || "",
            quantity: item.quantity || 1,
            rate: item.rate || 0,
          }));
          setItems(populatedItems);
        }

        // Store template ID for linking
        setTemplateId(template.id);

        // Clear sessionStorage
        sessionStorage.removeItem("selectedTemplate");
      } catch (err) {
        console.error("Failed to load template:", err);
      }
    }
  }, [initialData]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);

    const selected = customers.find((customer) => customer.id === customerId);
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      customerName: selected.name,
      customerEmail: selected.email,
      customerAddress: selected.address,
      customerCity: selected.city,
      customerState: selected.state,
      customerZipCode: selected.zipCode,
      customerCountry: selected.country,
      customerLogo: selected.logo || "",
    }));
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);

    const selected = companies.find((c) => c.id === companyId);
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      companyName: selected.name,
      companyEmail: selected.email,
      companyPhone: selected.phone || "",
      companyAddress: selected.address,
      companyCity: selected.city,
      companyState: selected.state,
      companyZipCode: selected.zipCode,
      companyCountry: selected.country,
      companyLogo: selected.logo || "",
      companyTaxId: selected.taxId || "",
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: String(items.length + 1),
        description: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      setIsSavingTemplate(true);

      const template: InvoiceTemplate = {
        id: String(Date.now()),
        name: templateName,
        description: templateDescription,
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          address: formData.customerAddress,
          city: formData.customerCity,
          state: formData.customerState,
          zipCode: formData.customerZipCode,
          country: formData.customerCountry,
          logo: formData.customerLogo || undefined,
        },
        company: formData.companyName
          ? {
              name: formData.companyName,
              email: formData.companyEmail,
              phone: formData.companyPhone || undefined,
              address: formData.companyAddress,
              city: formData.companyCity,
              state: formData.companyState,
              zipCode: formData.companyZipCode,
              country: formData.companyCountry,
              logo: formData.companyLogo || undefined,
              taxId: formData.companyTaxId || undefined,
            }
          : undefined,
        accountId:
          selectedAccountId && selectedAccountId !== "none"
            ? selectedAccountId
            : undefined,
        items,
        notes: formData.notes,
        taxRate: Number(formData.taxRate),
        currency: formData.currency,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };

      await createTemplate(template);
      toast.success("Template saved successfully!");
      setShowSaveTemplateModal(false);
      setTemplateName("");
      setTemplateDescription("");
    } catch (error) {
      toast.error("Failed to save template. Please try again.");
      console.error(error);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      const formErrors = validateInvoiceForm({
        ...formData,
        items,
      });

      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setIsLoading(false);
        return;
      }

      // Create invoice object
      const customerId =
        initialData?.customer.id || selectedCustomerId || String(Date.now());

      const invoice: Invoice = {
        id: initialData?.id || String(Date.now()),
        invoiceNumber: formData.invoiceNumber,
        date: formData.date,
        dueDate: formData.dueDate,
        status: initialData?.status || "draft",
        customer: {
          id: customerId,
          name: formData.customerName,
          email: formData.customerEmail,
          address: formData.customerAddress,
          city: formData.customerCity,
          state: formData.customerState,
          zipCode: formData.customerZipCode,
          country: formData.customerCountry,
          logo: formData.customerLogo || undefined,
        },
        company: formData.companyName
          ? {
              id:
                selectedCompanyId ||
                initialData?.company?.id ||
                String(Date.now()),
              name: formData.companyName,
              email: formData.companyEmail,
              phone: formData.companyPhone || undefined,
              address: formData.companyAddress,
              city: formData.companyCity,
              state: formData.companyState,
              zipCode: formData.companyZipCode,
              country: formData.companyCountry,
              logo: formData.companyLogo || undefined,
              taxId: formData.companyTaxId || undefined,
              isDefault: false,
              createdAt:
                initialData?.company?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : undefined,
        items,
        notes: formData.notes,
        taxRate: Number(formData.taxRate),
        discountType:
          formData.discountValue > 0 ? formData.discountType : undefined,
        discountValue:
          formData.discountValue > 0
            ? Number(formData.discountValue)
            : undefined,
        currency: formData.currency,
        templateId,
        accountId:
          selectedAccountId && selectedAccountId !== "none"
            ? selectedAccountId
            : undefined,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSubmit(invoice);
      setErrors({});
    } catch (error) {
      console.error("[InvoiceForm]", error);
      setErrors({
        submit: "Failed to save invoice. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const summary = calculateInvoiceSummary(
    items,
    Number(formData.taxRate),
    formData.discountType,
    Number(formData.discountValue),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Invoice Number"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              error={errors.invoiceNumber}
              leadingIcon={<Hash className="h-4 w-4" />}
            />
            <div className="p-1">
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Currency
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-8 text-center text-(--muted) text-base leading-none">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger className="pl-12">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.label} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker
              label="Invoice Date"
              value={formData.date}
              onChange={(value) => {
                const dueDate = toLocalDateString(
                  new Date(new Date(value).getTime() + 7 * 24 * 60 * 60 * 1000),
                );
                setFormData((prev) => ({ ...prev, date: value, dueDate }));
              }}
            />
            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, dueDate: value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Information (From) — auth only */}
      <Card>
        <CardHeader>
          <CardTitle>Your Company / Freelancer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isGuest && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-(--muted) mb-1">
                  Select Company
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <Select
                    value={selectedCompanyId || undefined}
                    onValueChange={(value) => handleCompanySelect(value)}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Choose a saved company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-end">
                <Link
                  href="/company"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Manage companies
                </Link>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              leadingIcon={<Building2 className="h-4 w-4" />}
            />
            <Input
              label="Email"
              name="companyEmail"
              type="email"
              value={formData.companyEmail}
              onChange={handleInputChange}
              leadingIcon={<Mail className="h-4 w-4" />}
            />
          </div>
          {/* More Details toggle */}
          <button
            type="button"
            onClick={() => setShowCompanyDetails(!showCompanyDetails)}
            className="flex items-center gap-1.5 text-sm font-medium text-(--muted) hover:text-black dark:hover:text-white transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showCompanyDetails ? "rotate-180" : ""}`}
            />
            {showCompanyDetails
              ? "Hide details"
              : "More details (phone, address, tax ID)"}
          </button>
          <AnimatePresence>
            {showCompanyDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { type: "spring", damping: 25, stiffness: 200 },
                  opacity: { duration: 0.2 },
                }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-4 pt-1 px-1 pb-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Phone"
                      name="companyPhone"
                      value={formData.companyPhone}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Tax ID"
                      name="companyTaxId"
                      value={formData.companyTaxId}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Input
                    label="Address"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    leadingIcon={<MapPin className="h-4 w-4" />}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="City"
                      name="companyCity"
                      value={formData.companyCity}
                      onChange={handleInputChange}
                      leadingIcon={<Building2 className="h-4 w-4" />}
                    />
                    <Input
                      label="State/Province"
                      name="companyState"
                      value={formData.companyState}
                      onChange={handleInputChange}
                      leadingIcon={<Map className="h-4 w-4" />}
                    />
                    <Input
                      label="Zip/Postal Code"
                      name="companyZipCode"
                      value={formData.companyZipCode}
                      onChange={handleInputChange}
                      leadingIcon={<Hash className="h-4 w-4" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--muted) mb-1">
                      Country
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                        <Globe className="h-4 w-4" />
                      </span>
                      <Select
                        value={formData.companyCountry || undefined}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            companyCountry: value,
                          }))
                        }
                      >
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isGuest && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-(--muted) mb-1">
                  Select Customer
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                    <User className="h-4 w-4" />
                  </span>
                  <Select
                    value={selectedCustomerId || undefined}
                    onValueChange={(value) => handleCustomerSelect(value)}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Choose an existing customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-end">
                <Link
                  href="/customers"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Manage customers
                </Link>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              error={errors.customerName}
              required
              leadingIcon={<User className="h-4 w-4" />}
            />
            <Input
              label="Email"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleInputChange}
              error={errors.customerEmail}
              required
              leadingIcon={<Mail className="h-4 w-4" />}
            />
          </div>
          {/* More Details toggle */}
          <button
            type="button"
            onClick={() => setShowCustomerDetails(!showCustomerDetails)}
            className="flex items-center gap-1.5 text-sm font-medium text-(--muted) hover:text-black dark:hover:text-white transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showCustomerDetails ? "rotate-180" : ""}`}
            />
            {showCustomerDetails
              ? "Hide details"
              : "More details (address, city, country)"}
          </button>
          <AnimatePresence>
            {showCustomerDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { type: "spring", damping: 25, stiffness: 200 },
                  opacity: { duration: 0.2 },
                }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-4 pt-1 px-1 pb-1">
                  <Input
                    label="Address"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    leadingIcon={<MapPin className="h-4 w-4" />}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="City"
                      name="customerCity"
                      value={formData.customerCity}
                      onChange={handleInputChange}
                      leadingIcon={<Building2 className="h-4 w-4" />}
                    />
                    <Input
                      label="State/Province"
                      name="customerState"
                      value={formData.customerState}
                      onChange={handleInputChange}
                      leadingIcon={<Map className="h-4 w-4" />}
                    />
                    <Input
                      label="Zip/Postal Code"
                      name="customerZipCode"
                      value={formData.customerZipCode}
                      onChange={handleInputChange}
                      leadingIcon={<Hash className="h-4 w-4" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--muted) mb-1">
                      Country
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                        <Globe className="h-4 w-4" />
                      </span>
                      <Select
                        value={formData.customerCountry}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            customerCountry: value,
                          }))
                        }
                      >
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] border-(--border)"
              >
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="shrink-0 flex rounded-lg border border-(--border) overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleItemChange(index, "type", "item")}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                          item.type !== "hours"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-(--surface-raised) text-(--muted) hover:bg-(--border)"
                        }`}
                      >
                        <Hash className="h-3.5 w-3.5" /> Item
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemChange(index, "type", "hours")}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                          item.type === "hours"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-(--surface-raised) text-(--muted) hover:bg-(--border)"
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" /> Hours
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder={
                        item.type === "hours"
                          ? "Service / task description"
                          : "Item description"
                      }
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      leadingIcon={<FileText className="h-4 w-4" />}
                      className="flex-1"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[96px_1fr_auto]">
                    <div>
                      <span className="block text-xs text-(--muted)">
                        {item.type === "hours" ? "Hours" : "Qty"}
                      </span>
                      <Input
                        type="number"
                        placeholder={item.type === "hours" ? "0.0" : "0"}
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value),
                          )
                        }
                        min="0.01"
                        step={item.type === "hours" ? "0.25" : "0.01"}
                        leadingIcon={
                          item.type === "hours" ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <Hash className="h-4 w-4" />
                          )
                        }
                      />
                    </div>
                    <div>
                      <span className="block text-xs text-(--muted)">
                        {item.type === "hours" ? "Rate/hr" : "Rate"}
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.rate || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "rate",
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value),
                          )
                        }
                        min="0"
                        step="0.01"
                        leadingIcon={<DollarSign className="h-4 w-4" />}
                      />
                    </div>
                    <div className="flex items-end justify-end px-3 py-2 text-right font-semibold text-black dark:text-white">
                      {formatCurrency(
                        (item.quantity || 0) * (item.rate || 0),
                        formData.currency,
                      )}
                    </div>
                  </div>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle for tax & discount */}
          <button
            type="button"
            onClick={() => setShowTaxDiscount(!showTaxDiscount)}
            className="flex items-center gap-1.5 text-sm font-medium text-(--muted) hover:text-black dark:hover:text-white transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showTaxDiscount ? "rotate-180" : ""}`}
            />
            {showTaxDiscount ? "Hide tax & discount" : "Add tax or discount"}
          </button>
          <AnimatePresence>
            {showTaxDiscount && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { type: "spring", damping: 25, stiffness: 200 },
                  opacity: { duration: 0.2 },
                }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-4 pt-1 px-1 pb-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Tax Rate (%)"
                      name="taxRate"
                      type="number"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                    />
                    <div>
                      <label className="block text-sm font-medium text-(--muted) mb-1">
                        Discount
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.discountType}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              discountType: v as "percentage" | "fixed",
                            }))
                          }
                        >
                          <SelectTrigger className="w-20 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-1 min-w-0">
                          <Input
                            name="discountValue"
                            type="number"
                            value={formData.discountValue}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder={
                              formData.discountType === "percentage"
                                ? "0"
                                : "0.00"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-2 border-t pt-4 border-(--border)">
            <div className="flex justify-between text-sm">
              <span className="text-(--muted)">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(summary.subtotal, formData.currency)}
              </span>
            </div>
            {summary.itemDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-(--muted)">Item Discount:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -{formatCurrency(summary.itemDiscount, formData.currency)}
                </span>
              </div>
            )}
            {summary.globalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-(--muted)">
                  Discount (
                  {formData.discountType === "percentage"
                    ? `${formData.discountValue}%`
                    : "Fixed"}
                  ):
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -{formatCurrency(summary.globalDiscount, formData.currency)}
                </span>
              </div>
            )}
            {summary.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-(--muted)">
                  Tax ({formData.taxRate}%):
                </span>
                <span className="font-medium">
                  {formatCurrency(summary.taxAmount, formData.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-lg font-bold border-(--border)">
              <span>Total:</span>
              <span>{formatCurrency(summary.total, formData.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            placeholder="Add any additional notes or terms..."
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Bank Account — auth only */}
      {!isGuest && accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-(--muted) mb-3">
              Select a bank account to include payment details on the invoice.
            </p>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="No bank account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No bank account</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.bankName} — {acc.accountNumber}
                    {acc.isDefault ? " (Default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          {initialData ? "Update Invoice" : "Create Invoice"}
        </Button>
        {!isGuest && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowSaveTemplateModal(true)}
            className="order-3 w-full sm:order-2 sm:w-auto"
          >
            <BookmarkPlus className="h-4 w-4 text-blue-500" />
            Save as Template
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          className="order-2 w-full sm:order-3 sm:w-auto"
        >
          <X className="h-4 w-4 text-red-500" />
          Cancel
        </Button>
      </div>

      {errors.submit && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {errors.submit}
        </div>
      )}

      {/* Save Template Modal */}
      <Dialog
        open={showSaveTemplateModal}
        onOpenChange={setShowSaveTemplateModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Monthly Service Invoice"
              autoFocus
              leadingIcon={<FileText className="h-4 w-4" />}
            />
            <div>
              <label className="block text-sm font-medium text-(--muted) mb-1">
                Description (Optional)
              </label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Add any notes about this template..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="border-t pt-4 border-(--border)">
            <Button
              type="button"
              onClick={handleSaveAsTemplate}
              isLoading={isSavingTemplate}
              className="flex-1"
            >
              <BookmarkPlus className="h-4 w-4 text-blue-400" />
              Save Template
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowSaveTemplateModal(false)}
              className="flex-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
