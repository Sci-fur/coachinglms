import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "../lib/utils";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm animate-in slide-in-from-right",
                toast.type === "success" && "bg-green-50 border-green-200 text-green-800",
                toast.type === "error" && "bg-red-50 border-red-200 text-red-800",
                toast.type === "info" && "bg-blue-50 border-blue-200 text-blue-800",
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
