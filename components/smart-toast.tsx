import { SmartToast } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

export function ToastList({ toasts }: { toasts: SmartToast[] }) {
  const icons = {
    success: <CheckCircle className="text-white" />,
    error: <AlertTriangle className="text-white" />,
    info: <Info className="text-white" />,
  };

  const colors = {
    success: "bg-green text-white",
    error: "bg-red text-white",
    info: "bg-blue text-white",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full flex flex-col items-center gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
            className={`pointer-events-auto w-[70%] px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 ${colors[toast.type]}`}
          >
            <div className="mt-1">{icons[toast.type]}</div>

            <div className="flex flex-col">
              <strong className="font-semibold">{toast.title}</strong>
              {toast.message && (
                <p className="text-sm opacity-90">{toast.message}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
