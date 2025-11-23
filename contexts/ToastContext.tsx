"use client";

import { ToastList } from "@/components/smart-toast";
import { createContext, useContext, useState, ReactNode } from "react";

export interface SmartToast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastContextData {
  showToast: (toast: Omit<SmartToast, "id">) => void;
}

const ToastContext = createContext<ToastContextData | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<SmartToast[]>([]);

  const showToast = (toast: Omit<SmartToast, "id">) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, ...toast }]);

    // Auto-remove
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000
    );
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastList toasts={toasts} />
    </ToastContext.Provider>
  );
}

export const useSmartToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useSmartToast deve ser usado dentro de ToastProvider");
  return ctx;
};
