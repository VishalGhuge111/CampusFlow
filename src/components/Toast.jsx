import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  const ToastComponent = () => {
    if (!toast) return null;

    return (
      <div
        className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${
          toast.type === "success"
            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
        }`}
      >
        {toast.type === "success" ? (
          <Check size={20} />
        ) : (
          <X size={20} />
        )}
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    );
  };

  return { showToast, ToastComponent };
}

export default function Toast({ message, type = "success" }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
        type === "success"
          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
      }`}
    >
      {type === "success" ? (
        <Check size={20} />
      ) : (
        <X size={20} />
      )}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}
