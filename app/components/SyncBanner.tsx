"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloudUpload, X, Check, Loader2 } from "lucide-react";
import Button from "@/app/components/shared/Button";
import { useHasLocalData } from "@/app/components/DbScopeProvider";
import { idbGetAllData, idbClearAll } from "@/app/lib/idb-storage";
import { toast } from "sonner";

export default function SyncBanner() {
  const hasLocalData = useHasLocalData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [synced, setSynced] = useState(false);

  if (!hasLocalData || dismissed || synced) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const data = await idbGetAllData();
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Sync failed");
      }

      const result = await res.json();
      const total = result.synced.invoices + result.synced.customers + result.synced.templates + result.synced.companies + result.synced.accounts;

      // Clear local data after successful sync
      await idbClearAll();
      setSynced(true);
      toast.success(`Synced ${total} item${total !== 1 ? "s" : ""} to your account`);
    } catch {
      toast.error("Failed to sync data. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="border-b border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <CloudUpload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  You have local data from before signing in
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Sync it to your account so you don&apos;t lose it.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSyncing ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing...</>
                ) : (
                  <><Check className="h-3.5 w-3.5" /> Sync Now</>
                )}
              </Button>
              <button
                onClick={() => setDismissed(true)}
                className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
