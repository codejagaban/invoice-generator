"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import Button from "./Button";

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

/**
 * Hook that provides a promise-based confirm dialog.
 * Usage:
 *   const [confirm, ConfirmDialogUI] = useConfirm();
 *   const ok = await confirm({ description: "Delete this?" });
 *   if (!ok) return;
 *   // ... proceed
 *   // Render <ConfirmDialogUI /> somewhere in JSX
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
  }>({ open: false, options: { description: "" } });

  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, options });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setState((s) => ({ ...s, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setState((s) => ({ ...s, open: false }));
  }, []);

  const ConfirmDialogUI = useCallback(() => {
    if (typeof document === "undefined") return null;
    const { options } = state;

    return createPortal(
      <AnimatePresence>
        {state.open && (
          <ConfirmDialogInner
            title={options.title || (options.variant === "danger" ? "Delete" : "Warning")}
            description={options.description}
            confirmLabel={options.confirmLabel || "Confirm"}
            cancelLabel={options.cancelLabel || "Cancel"}
            variant={options.variant || "default"}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>,
      document.body,
    );
  }, [state, handleConfirm, handleCancel]);

  return [confirm, ConfirmDialogUI] as const;
}

function ConfirmDialogInner({
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const iconBg = variant === "danger" ? "bg-red-50 dark:bg-red-950/30" : "bg-amber-50 dark:bg-amber-950/30";
  const iconColor = variant === "danger" ? "text-red-500" : "text-amber-500";
  const Icon = variant === "danger" ? Trash2 : AlertTriangle;
  const confirmBg = variant === "danger"
    ? "bg-red-500 hover:bg-red-600 text-white"
    : "bg-amber-500 hover:bg-amber-600 text-white";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[3px] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-sm rounded-2xl border border-(--border) bg-white dark:bg-[#1a1a1a] shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-(--muted) transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Icon */}
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold text-black dark:text-white">{title}</h3>
        <p className="mt-1.5 text-sm text-(--muted)">{description}</p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${confirmBg}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
