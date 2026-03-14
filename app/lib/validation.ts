/**
 * Form Validation Utilities
 * Validation schemas for invoice forms and user inputs
 */

export const invoiceValidation = {
  invoiceNumber: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Invoice number is required";
    }
    return null;
  },

  customerName: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Customer name is required";
    }
    if (value.length > 100) {
      return "Customer name must be less than 100 characters";
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  itemDescription: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Item description is required";
    }
    return null;
  },

  quantity: (value: number | string): string | null => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return "Quantity must be greater than 0";
    }
    return null;
  },

  rate: (value: number | string): string | null => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num < 0) {
      return "Rate must be a positive number";
    }
    return null;
  },

  dueDate: (dueDate: string, invoiceDate: string): string | null => {
    if (!dueDate) {
      return "Due date is required";
    }
    const due = new Date(dueDate);
    const invoice = new Date(invoiceDate);
    if (due < invoice) {
      return "Due date must be after invoice date";
    }
    return null;
  },
};

export const validateInvoiceForm = (
  data: Record<string, unknown>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Basic validation
  if (!data.invoiceNumber) errors.invoiceNumber = "Invoice number is required";
  if (!data.customerName) errors.customerName = "Customer name is required";
  if (!data.customerEmail) errors.customerEmail = "Customer email is required";
  if (!data.items || (data.items as unknown[]).length === 0)
    errors.items = "At least one item is required";

  return errors;
};
